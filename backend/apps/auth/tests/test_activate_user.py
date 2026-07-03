import time
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from core.common_services.jwt_service import JWTService, ActivateToken


UserModel = get_user_model()


class ActivateUserViewTests(APITestCase):
    def setUp(self):
        self.user = UserModel.objects.create_user(
            email="u1@example.com",
            password="StrongPass123!",
            is_active=False,
            email_verified=False,
        )

    def _url(self, token: str) -> str:
        return reverse("auth-activate-account", kwargs={"token": token})

    def test_activate_success_sets_is_active_and_email_verified_and_consumes_token(self):
        token = JWTService.create_action_token(self.user, ActivateToken)

        r = self.client.get(self._url(token))
        self.assertEqual(r.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)
        self.assertTrue(self.user.email_verified)

        # РїРѕРІС‚РѕСЂРЅС‹Р№ РєР»РёРє РїРѕ С‚РѕР№ Р¶Рµ СЃСЃС‹Р»РєРµ -> token СѓР¶Рµ "РёСЃРїРѕР»СЊР·РѕРІР°РЅ" (blacklist)
        r2 = self.client.get(self._url(token))
        self.assertEqual(r2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(r2.data.get("detail"), "Р¦Рµ РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ Р°РєС‚РёРІР°С†С–С— РІР¶Рµ РІРёРєРѕСЂРёСЃС‚Р°РЅРѕ.")

    def test_activate_invalid_token(self):
        r = self.client.get(self._url("not-a-real-token"))
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(r.data.get("detail"), "РќРµРґС–Р№СЃРЅРµ РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ Р°РєС‚РёРІР°С†С–С—.")

    def test_activate_expired_token(self):
        # вљ пёЏ РїСЂРѕСЃС‚РѕР№ (Рё С‡СѓС‚СЊ РјРµРґР»РµРЅРЅС‹Р№) СЃРїРѕСЃРѕР± РїСЂРѕРІРµСЂРёС‚СЊ expire Р±РµР· РјРѕРєРѕРІ:
        # РґРµР»Р°РµРј lifetime РѕС‡РµРЅСЊ РєРѕСЂРѕС‚РєРёРј Рё Р¶РґС‘Рј, РїРѕРєР° РїСЂРѕС‚СѓС…РЅРµС‚.
        old_lifetime = ActivateToken.lifetime
        try:
            ActivateToken.lifetime = timedelta(seconds=1)
            token = JWTService.create_action_token(self.user, ActivateToken)

            time.sleep(2)

            r = self.client.get(self._url(token))
            self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(r.data.get("detail"), "РўРµСЂРјС–РЅ РґС–С— РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ Р°РєС‚РёРІР°С†С–С— РјРёРЅСѓРІ.")
        finally:
            ActivateToken.lifetime = old_lifetime
