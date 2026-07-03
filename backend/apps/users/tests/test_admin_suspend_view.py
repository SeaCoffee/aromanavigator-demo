# apps/users/tests/test_admin_suspend_view.py
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AdminSuspendUserViewTests(APITestCase):
    def _create_user(self, email: str, password: str = "Testpass123!", **extra):
        """
        РЈС‚РёР»С–С‚Р°: СЃС‚РІРѕСЂСЋС”РјРѕ РєРѕСЂРёСЃС‚СѓРІР°С‡Р° Р±РµР· РїСЂРёРІ'СЏР·РєРё РґРѕ РєР°СЃС‚РѕРјРЅРѕРіРѕ РјРµРЅРµРґР¶РµСЂР°.
        РЇРєС‰Рѕ С” РЅРѕСЂРјР°Р»СЊРЅРёР№ create_user, РјРѕР¶РЅР° Р·Р°РјС–РЅРёС‚Рё РЅР° РЅСЊРѕРіРѕ.
        """
        user = User(email=email, **extra)
        user.set_password(password)
        user.save()
        return user

    def test_admin_can_suspend_other_user(self):
        """
        РђРґРјС–РЅ (superuser) РјРѕР¶Рµ Р·Р°Р±Р»РѕРєСѓРІР°С‚Рё С–РЅС€РѕРіРѕ РєРѕСЂРёСЃС‚СѓРІР°С‡Р°:
        - СЃС‚Р°С‚СѓСЃ 200
        - Сѓ РІС–РґРїРѕРІС–РґС– РїСЂР°РІРёР»СЊРЅС– РїРѕР»СЏ
        - Сѓ Р‘Р” СЂРµР°Р»СЊРЅРѕ РїСЂРѕСЃС‚Р°РІР»РµРЅС– suspended_until, suspended_reason, suspended_by
        """
        admin = self._create_user(
            "admin@example.com",
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        target = self._create_user("target@example.com", is_active=True)

        self.client.force_authenticate(user=admin)

        until = timezone.now() + timedelta(hours=1)
        url = reverse("admin-user-suspend", args=[target.id])
        payload = {
            "until": until.isoformat(),
            "reason": "Test block",
        }

        resp = self.client.patch(url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)

        target.refresh_from_db()
        self.assertTrue(target.is_suspended)
        self.assertIsNotNone(target.suspended_until)
        self.assertGreater(target.suspended_until, timezone.now())
        self.assertEqual(target.suspended_reason, "Test block")
        self.assertEqual(target.suspended_by_id, admin.id)

        self.assertEqual(resp.data["id"], target.id)
        self.assertTrue(resp.data["is_suspended"])
        self.assertIsNotNone(resp.data["suspended_until"])

    def test_admin_cannot_suspend_self(self):
        """
        РЎРїСЂРѕР±Р° Р·Р°Р±Р»РѕРєСѓРІР°С‚Рё СЃР°РјРѕРіРѕ СЃРµР±Рµ С‡РµСЂРµР· /<pk>/suspend
        РјР°С” РїСЂРёРІРµСЃС‚Рё РґРѕ 400 Р· С‚РµРєСЃС‚РѕРј 'РќРµ РјРѕР¶РЅР° Р±Р»РѕРєСѓРІР°С‚Рё СЃР°РјРѕРіРѕ СЃРµР±Рµ.'
        (ValidationError РёР· AdminSuspensionService).
        """
        admin = self._create_user(
            "admin@example.com",
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        self.client.force_authenticate(user=admin)

        until = timezone.now() + timedelta(hours=1)
        url = reverse("admin-user-suspend", args=[admin.id])
        payload = {
            "until": until.isoformat(),
            "reason": "Self block",
        }

        resp = self.client.patch(url, payload, format="json")
        # РЈР¶Рµ РЅРµ 403 (РїСЂР°РІР° С”), Р° РїРѕРјРёР»РєР° РІР°Р»С–РґР°С†С–С— С–Р· СЃРµСЂРІС–СЃСѓ.
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND, resp.data)

        admin.refresh_from_db()
        self.assertFalse(admin.is_suspended)
        self.assertIsNone(admin.suspended_until)

    def test_cannot_suspend_with_past_until(self):
        """
        РЇРєС‰Рѕ РІ until РїРµСЂРµРґР°С‚Рё РјРёРЅСѓР»РёР№ С‡Р°СЃ, AdminSuspensionService
        РїС–РґРЅС–РјР°С” ValidationError -> 400.
        """
        admin = self._create_user(
            "admin@example.com",
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        target = self._create_user("target@example.com", is_active=True)

        self.client.force_authenticate(user=admin)

        until = timezone.now() - timedelta(hours=1)
        url = reverse("admin-user-suspend", args=[target.id])
        payload = {
            "until": until.isoformat(),
            "reason": "Past date",
        }

        resp = self.client.patch(url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST, resp.data)
        self.assertIn("Р”Р°С‚Р° Р·Р°РІРµСЂС€РµРЅРЅСЏ РјР°С” Р±СѓС‚Рё РІ РјР°Р№Р±СѓС‚РЅСЊРѕРјСѓ", str(resp.data))

        target.refresh_from_db()
        self.assertFalse(target.is_suspended)
        self.assertIsNone(target.suspended_until)
