# apps/users/tests/test_admin_unsuspend_and_me_suspended.py
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AdminUnsuspendAndMeSuspendedTests(APITestCase):
    def _create_user(self, email: str, password: str = "Testpass123!", **extra):
        """
        РЈС‚РёР»РёС‚Р°: СЃРѕР·РґР°С‘Рј СЋР·РµСЂР°.
        Р•СЃР»Рё Сѓ С‚РµР±СЏ РµСЃС‚СЊ РЅРѕСЂРјР°Р»СЊРЅС‹Р№ create_user вЂ“ РјРѕР¶РЅРѕ Р·Р°РјРµРЅРёС‚СЊ.
        """
        user = User(email=email, **extra)
        user.set_password(password)
        user.save()
        return user

    def test_admin_can_unsuspend_user(self):
        """
        РђРґРјРёРЅ (superuser) РјРѕР¶РµС‚ СЂР°Р·Р±Р°РЅРёС‚СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ:
        - СЃС‚Р°С‚СѓСЃ 200
        - РІ РѕС‚РІРµС‚Рµ is_suspended == False
        - РІ Р‘Р” suspended_until, suspended_reason, suspended_by СЃР±СЂРѕС€РµРЅС‹
        """
        admin = self._create_user(
            "admin@example.com",
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        # Р·Р°СЂР°РЅРµРµ Р·Р°Р±Р°РЅРµРЅРЅС‹Р№ СЋР·РµСЂ
        target = self._create_user("target@example.com", is_active=True)
        target.suspended_until = timezone.now() + timedelta(hours=1)
        target.suspended_reason = "Some reason"
        target.suspended_by = admin
        target.save()

        self.client.force_authenticate(user=admin)

        url = reverse("admin-user-unsuspend", args=[target.id])
        resp = self.client.patch(url, {}, format="json")

        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assertEqual(resp.data["id"], target.id)
        self.assertFalse(resp.data["is_suspended"])

        target.refresh_from_db()
        self.assertFalse(target.is_suspended)
        self.assertIsNone(target.suspended_until)
        self.assertEqual(target.suspended_reason, "")
        self.assertIsNone(target.suspended_by)

    def test_me_suspended_view_for_not_suspended_user(self):
        """
        /me-sespended РґР»СЏ РѕР±С‹С‡РЅРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ:
        - is_suspended == False
        - suspended_until == None
        - РµСЃС‚СЊ РїРѕР»Рµ server_now (РІР°Р»РёРґРЅР°СЏ ISO-СЃС‚СЂРѕРєР°, РЅРѕ РјС‹ РїСЂРѕСЃС‚Рѕ РїСЂРѕРІРµСЂСЏРµРј РЅР°Р»РёС‡РёРµ)
        """
        user = self._create_user(
            "user@example.com",
            is_active=True,
        )
        self.client.force_authenticate(user=user)

        url = reverse("users-me-suspended")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assertIn("is_suspended", resp.data)
        self.assertIn("suspended_until", resp.data)
        self.assertIn("server_now", resp.data)

        self.assertFalse(resp.data["is_suspended"])
        self.assertIsNone(resp.data["suspended_until"])
        self.assertIsInstance(resp.data["server_now"], str)

    def test_me_suspended_view_for_suspended_user(self):
        """
        /me-sespended РґР»СЏ Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅРЅРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ:
        - is_suspended == True
        - suspended_until != None
        - server_now РїСЂРёСЃСѓС‚СЃС‚РІСѓРµС‚
        """
        user = self._create_user(
            "user2@example.com",
            is_active=True,
        )
        user.suspended_until = timezone.now() + timedelta(hours=2)
        user.suspended_reason = "Test block"
        user.save()

        self.client.force_authenticate(user=user)

        url = reverse("users-me-suspended")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assertTrue(resp.data["is_suspended"])
        self.assertIsNotNone(resp.data["suspended_until"])
        self.assertIsInstance(resp.data["server_now"], str)
