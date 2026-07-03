from datetime import timedelta
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from apps.users.models import UserModel

class AdminSuspendTests(APITestCase):
    def setUp(self):
        self.admin = UserModel.objects.create_user(
            email="admin@test.com", password="pass", is_staff=True, is_active=True
        )
        self.target = UserModel.objects.create_user(
            email="user@test.com", password="pass", is_active=True
        )

    def test_admin_can_suspend_user(self):
        self.client.force_authenticate(self.admin)

        until = timezone.now() + timedelta(days=3)
        url = f"/userApi/users/{self.target.id}/suspend"
        r = self.client.patch(url, {"until": until.isoformat(), "reason": "spam"}, format="json")

        self.assertEqual(r.status_code, status.HTTP_200_OK)

        self.target.refresh_from_db()
        self.assertIsNotNone(self.target.suspended_until)
        self.assertEqual(self.target.suspended_reason, "spam")
        self.assertEqual(self.target.suspended_by_id, self.admin.id)
        self.assertTrue(self.target.is_suspended)

    def test_suspend_rejects_past_date(self):
        self.client.force_authenticate(self.admin)

        until = timezone.now() - timedelta(hours=1)
        url = f"/userApi/users/{self.target.id}/suspend"
        r = self.client.patch(url, {"until": until.isoformat()}, format="json")

        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_suspend_self(self):
        self.client.force_authenticate(self.admin)

        until = timezone.now() + timedelta(days=1)
        url = f"/userApi/users/{self.admin.id}/suspend"
        r = self.client.patch(url, {"until": until.isoformat()}, format="json")

        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_can_unsuspend_user(self):
        self.target.suspended_until = timezone.now() + timedelta(days=1)
        self.target.suspended_reason = "test"
        self.target.suspended_by = self.admin
        self.target.save()

        self.client.force_authenticate(self.admin)

        url = f"/userApi/users/{self.target.id}/unsuspend"
        r = self.client.patch(url, {}, format="json")

        self.assertEqual(r.status_code, status.HTTP_200_OK)

        self.target.refresh_from_db()
        self.assertIsNone(self.target.suspended_until)
        self.assertEqual(self.target.suspended_reason, "")
        self.assertIsNone(self.target.suspended_by)
        self.assertFalse(self.target.is_suspended)
