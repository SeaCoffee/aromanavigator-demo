# apps/users/tests/test_suspension_service.py
from datetime import timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone

from apps.users.models import UserModel, UserSuspension
from apps.users.admin_suspension_service import AdminSuspensionService


class SuspensionServiceTests(TestCase):
    def setUp(self):
        self.admin = UserModel.objects.create_user(
            email="admin@test.com", password="x", is_active=True, is_staff=True
        )
        self.target = UserModel.objects.create_user(
            email="user@test.com", password="x", is_active=True
        )

    def test_suspend_creates_history_and_sets_cache_fields(self):
        until = timezone.now() + timedelta(hours=2)
        AdminSuspensionService.suspend(self.admin, self.target, until, reason="spam")

        self.target.refresh_from_db()
        self.assertTrue(self.target.is_suspended)
        self.assertEqual(self.target.suspended_reason, "spam")
        self.assertEqual(self.target.suspended_by_id, self.admin.id)

        h = UserSuspension.objects.filter(target=self.target).order_by("-started_at").first()
        self.assertIsNotNone(h)
        self.assertIsNone(h.ended_at)
        self.assertEqual(h.admin_id, self.admin.id)
        self.assertEqual(h.reason, "spam")
        self.assertEqual(h.until, until)

    def test_suspend_replaces_previous_active_history(self):
        until1 = timezone.now() + timedelta(hours=1)
        until2 = timezone.now() + timedelta(hours=3)

        AdminSuspensionService.suspend(self.admin, self.target, until1, reason="r1")
        AdminSuspensionService.suspend(self.admin, self.target, until2, reason="r2")

        hs = list(UserSuspension.objects.filter(target=self.target).order_by("started_at"))
        self.assertEqual(len(hs), 2)

        first, second = hs[0], hs[1]
        self.assertEqual(first.end_reason, "replaced")
        self.assertIsNotNone(first.ended_at)
        self.assertEqual(first.ended_by_id, self.admin.id)

        self.assertIsNone(second.ended_at)

    def test_unsuspend_closes_history_and_clears_user_fields(self):
        until = timezone.now() + timedelta(hours=1)
        AdminSuspensionService.suspend(self.admin, self.target, until, reason="r")

        AdminSuspensionService.unsuspend(self.admin, self.target)

        self.target.refresh_from_db()
        self.assertFalse(self.target.is_suspended)
        self.assertIsNone(self.target.suspended_until)
        self.assertEqual(self.target.suspended_reason, "")
        self.assertIsNone(self.target.suspended_by_id)

        h = UserSuspension.objects.filter(target=self.target).order_by("-started_at").first()
        self.assertEqual(h.end_reason, "manual")
        self.assertIsNotNone(h.ended_at)

    def test_cleanup_expired_closes_history_and_clears_user_fields(self):
        now = timezone.now()
        past_until = now - timedelta(seconds=1)

        # РёРјРёС‚РёСЂСѓРµРј Р°РєС‚РёРІРЅС‹Р№ Р±Р°РЅ РІ РєРµС€Рµ
        self.target.suspended_until = past_until
        self.target.suspended_reason = "tmp"
        self.target.suspended_by = self.admin
        self.target.save()

        # Рё Р°РєС‚РёРІРЅР°СЏ РёСЃС‚РѕСЂРёСЏ
        UserSuspension.objects.create(target=self.target, admin=self.admin, until=past_until, reason="tmp")

        ok = AdminSuspensionService.cleanup_expired(self.target)
        self.assertTrue(ok)

        self.target.refresh_from_db()
        self.assertFalse(self.target.is_suspended)
        self.assertIsNone(self.target.suspended_until)

        h = UserSuspension.objects.filter(target=self.target).order_by("-started_at").first()
        self.assertEqual(h.end_reason, "expired")
        self.assertIsNotNone(h.ended_at)
        self.assertIsNone(h.ended_by_id)
