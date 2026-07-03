from django.contrib.auth.models import Group
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import UserModel
from apps.users.models import ProfileModel  # РµСЃР»Рё ProfileModel РІ apps.users.models


class AdminUserActionsTests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.g_admin, _ = Group.objects.get_or_create(name="admin")
        cls.g_moderator, _ = Group.objects.get_or_create(name="moderator")

    def create_user_with_profile(
        self,
        email: str,
        *,
        password: str = "Testpass123!",
        is_active: bool = True,
        name: str = "Test",
        display_name: str | None = None,
    ) -> UserModel:
        u = UserModel.objects.create_user(email=email, password=password)
        # Сѓ С‚РµР±СЏ default is_active=False, РїРѕСЌС‚РѕРјСѓ РІС‹СЃС‚Р°РІРёРј РєР°Рє РЅСѓР¶РЅРѕ РґР»СЏ С‚РµСЃС‚РѕРІ
        u.is_active = is_active
        u.save(update_fields=["is_active"])

        dn = display_name or email.split("@")[0]
        ProfileModel.objects.create(user=u, name=name, display_name=dn)
        return u

    def create_admin(self, email="admin@example.com") -> UserModel:
        u = self.create_user_with_profile(email, display_name="admin_dn")
        u.groups.add(self.g_admin)
        u.is_staff = True
        u.save(update_fields=["is_staff"])
        return u

    def create_superuser(self, email="su@example.com") -> UserModel:
        su = UserModel.objects.create_superuser(email=email, password="Testpass123!")
        # РїСЂРѕС„РёР»СЊ СЃСѓРїРµСЂСЋР·РµСЂСѓ С‚РѕР¶Рµ РЅСѓР¶РµРЅ, РёРЅР°С‡Рµ СЃРµСЂРёР°Р»Р°Р№Р·РµСЂ РјРѕР¶РµС‚ СѓРїР°СЃС‚СЊ РЅР° profile
        ProfileModel.objects.create(user=su, name="SU", display_name="su_dn")
        return su

    # ---- block/unblock ----

    def test_block_requires_auth_401(self):
        target = self.create_user_with_profile("u1@example.com", display_name="u1_dn")
        url = reverse("user_block", kwargs={"pk": target.pk})
        r = self.client.patch(url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_can_block_and_unblock(self):
        admin = self.create_admin()
        target = self.create_user_with_profile("u2@example.com", is_active=True, display_name="u2_dn")

        self.client.force_authenticate(user=admin)

        url_block = reverse("user_block", kwargs={"pk": target.pk})
        r1 = self.client.patch(url_block)
        self.assertEqual(r1.status_code, status.HTTP_200_OK)

        target.refresh_from_db()
        self.assertTrue(target.is_active)
        self.assertTrue(target.is_suspended)
        self.assertTrue(target.suspended_indefinitely)

        url_unblock = reverse("user_unblock", kwargs={"pk": target.pk})
        r2 = self.client.patch(url_unblock)
        self.assertEqual(r2.status_code, status.HTTP_200_OK)

        target.refresh_from_db()
        self.assertTrue(target.is_active)
        self.assertFalse(target.is_suspended)

    def test_admin_cannot_block_self_404(self):
        admin = self.create_admin()
        self.client.force_authenticate(user=admin)

        url = reverse("user_block", kwargs={"pk": admin.pk})
        r = self.client.patch(url)
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_cannot_unblock_self_404(self):
        admin = self.create_admin()
        self.client.force_authenticate(user=admin)

        url = reverse("user_unblock", kwargs={"pk": admin.pk})
        r = self.client.patch(url)
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_cannot_block_superuser_403(self):
        admin = self.create_admin()
        su = self.create_superuser()

        self.client.force_authenticate(user=admin)

        url = reverse("user_block", kwargs={"pk": su.pk})
        r = self.client.patch(url)
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    # ---- role assignment ----

    def test_admin_cannot_to_admin_403(self):
        admin = self.create_admin()
        target = self.create_user_with_profile("u3@example.com", display_name="u3_dn")

        self.client.force_authenticate(user=admin)
        url = reverse("user_to_admin", kwargs={"pk": target.pk})
        r = self.client.patch(url)
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_superuser_can_to_admin(self):
        su = self.create_superuser()
        target = self.create_user_with_profile("u4@example.com", display_name="u4_dn")

        self.client.force_authenticate(user=su)
        url = reverse("user_to_admin", kwargs={"pk": target.pk})
        r = self.client.patch(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

        target.refresh_from_db()
        self.assertTrue(target.groups.filter(name="admin").exists())
        self.assertTrue(target.is_staff)
        self.assertTrue(target.is_active)

    def test_admin_can_to_moderator(self):
        admin = self.create_admin()
        target = self.create_user_with_profile("u5@example.com", display_name="u5_dn")

        self.client.force_authenticate(user=admin)
        url = reverse("user_to_moderator", kwargs={"pk": target.pk})
        r = self.client.patch(url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

        target.refresh_from_db()
        self.assertTrue(target.groups.filter(name="moderator").exists())
        self.assertTrue(target.is_staff)
        self.assertTrue(target.is_active)

    def test_to_admin_self_404(self):
        su = self.create_superuser()
        self.client.force_authenticate(user=su)

        url = reverse("user_to_admin", kwargs={"pk": su.pk})
        r = self.client.patch(url)
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_to_moderator_self_404(self):
        admin = self.create_admin()
        self.client.force_authenticate(user=admin)

        url = reverse("user_to_moderator", kwargs={"pk": admin.pk})
        r = self.client.patch(url)
        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)
