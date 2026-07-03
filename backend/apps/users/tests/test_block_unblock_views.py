# apps/users/tests/test_block_unblock_views.py
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class BlockUnblockUserViewTests(APITestCase):
    def _create_user(self, email: str, password: str = "Testpass123!", **extra):
        """
        РЈС‚РёР»РёС‚Р°: СЃРѕР·РґР°С‘Рј СЋР·РµСЂР°.
        """
        user = User(email=email, **extra)
        user.set_password(password)
        user.save()
        return user

    def test_admin_can_block_other_user(self):
        """
        РђРґРјРёРЅ (superuser) РјРѕР¶РµС‚ Р·Р°Р±Р»РѕРєРёСЂРѕРІР°С‚СЊ РґСЂСѓРіРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ:
        - СЃС‚Р°С‚СѓСЃ 200
        - is_active СЃС‚Р°РЅРѕРІРёС‚СЃСЏ False
        - РІ РѕС‚РІРµС‚Рµ СЃРµСЂРёР°Р»Р°Р№Р·РµСЂ РѕС‚РґР°С‘С‚ is_active=False
        """
        admin = self._create_user(
            "admin@example.com",
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        target = self._create_user("target@example.com", is_active=True)

        self.client.force_authenticate(user=admin)

        url = reverse("user_block", args=[target.id])
        resp = self.client.patch(url, {}, format="json")

        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)

        target.refresh_from_db()
        self.assertTrue(target.is_active)
        self.assertTrue(target.is_suspended)
        self.assertTrue(target.suspended_indefinitely)

        # UserSerializer РІ РѕС‚РІРµС‚Рµ
        self.assertIn("is_active", resp.data)
        self.assertTrue(resp.data["is_active"])
        self.assertTrue(resp.data["is_suspended"])

    def test_admin_cannot_block_self_because_queryset_excludes_self(self):
        """
        get_queryset Сѓ BlockUserView: UserModel.objects.exclude(id=self.request.user.id)
        в†’ РїРѕРїС‹С‚РєР° Р·Р°Р±Р»РѕРєРёСЂРѕРІР°С‚СЊ СЃРµР±СЏ РґРѕР»Р¶РЅР° РґР°С‚СЊ 404 (РѕР±СЉРµРєС‚ РЅРµ РЅР°Р№РґРµРЅ).
        """
        admin = self._create_user(
            "admin@example.com",
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        self.client.force_authenticate(user=admin)

        url = reverse("user_block", args=[admin.id])
        resp = self.client.patch(url, {}, format="json")

        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND, resp.data)

        admin.refresh_from_db()
        # С„Р»Р°Рі РЅРµ РёР·РјРµРЅРёР»СЃСЏ
        self.assertTrue(admin.is_active)

    def test_unblock_user_and_idempotency(self):
        """
        UnBlockUserView:
        - РїРµСЂРІС‹Р№ РІС‹Р·РѕРІ РґР»СЏ Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅРЅРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ в†’ is_active=True
        - РїРѕРІС‚РѕСЂРЅС‹Р№ РІС‹Р·РѕРІ РёРґРµРјРїРѕС‚РµРЅС‚РµРЅ: СЃС‚Р°С‚СѓСЃ 200, is_active РѕСЃС‚Р°С‘С‚СЃСЏ True
        """
        admin = self._create_user(
            "admin@example.com",
            is_staff=True,
            is_superuser=True,
            is_active=True,
        )
        target = self._create_user(
            "target2@example.com",
            is_active=True,
            suspended_indefinitely=True,
        )

        self.client.force_authenticate(user=admin)

        url = reverse("user_unblock", args=[target.id])

        # РїРµСЂРІС‹Р№ РІС‹Р·РѕРІ
        resp1 = self.client.patch(url, {}, format="json")
        self.assertEqual(resp1.status_code, status.HTTP_200_OK, resp1.data)

        target.refresh_from_db()
        self.assertTrue(target.is_active)
        self.assertFalse(target.is_suspended)
        self.assertIn("is_active", resp1.data)
        self.assertTrue(resp1.data["is_active"])

        # РІС‚РѕСЂРѕР№ РІС‹Р·РѕРІ (СѓР¶Рµ Р°РєС‚РёРІРµРЅ) вЂ” РґРѕР»Р¶РµРЅ РїСЂРѕСЃС‚Рѕ РІРµСЂРЅСѓС‚СЊ 200 Рё РЅРµ СЃР»РѕРјР°С‚СЊСЃСЏ
        resp2 = self.client.patch(url, {}, format="json")
        self.assertEqual(resp2.status_code, status.HTTP_200_OK, resp2.data)

        target.refresh_from_db()
        self.assertTrue(target.is_active)
        self.assertFalse(target.is_suspended)
