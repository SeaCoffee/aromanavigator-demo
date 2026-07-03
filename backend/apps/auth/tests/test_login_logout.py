# apps/auth/test/test_login_logout.py
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.state import token_backend

from django.contrib.auth import get_user_model


User = get_user_model()


class AuthLoginLogoutTests(APITestCase):
    def setUp(self):
        self.login_url = reverse("auth-login")
        self.refresh_url = reverse("auth-refresh")
        self.logout_url = reverse("auth-logout")

        self.password = "Str0ng!Pass123"

        self.active_user = User.objects.create(
            email="active@example.com",
            is_active=True,
        )
        self.active_user.set_password(self.password)
        self.active_user.save(update_fields=["password"])

        self.inactive_user = User.objects.create(
            email="inactive@example.com",
            is_active=False,
        )
        self.inactive_user.set_password(self.password)
        self.inactive_user.save(update_fields=["password"])

    def test_login_active_user_ok_returns_tokens(self):
        r = self.client.post(
            self.login_url,
            {"email": self.active_user.email, "password": self.password},
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertIn("access", r.data)
        self.assertIn("refresh", r.data)

    def test_login_inactive_user_forbidden(self):
        r = self.client.post(
            self.login_url,
            {"email": self.inactive_user.email, "password": self.password},
            format="json",
        )
        # вњ… Сѓ С‚РµР±СЏ СЃРµР№С‡Р°СЃ С„Р°РєС‚РёС‡РµСЃРєРё РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ 401, РЅРѕ РёРЅРѕРіРґР° СЌС‚Рѕ РґРµР»Р°СЋС‚ 403
        self.assertIn(r.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_logout_updates_last_logout_and_blacklists_refresh(self):
        # 1) login
        r = self.client.post(
            self.login_url,
            {"email": self.active_user.email, "password": self.password},
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        access = r.data["access"]
        refresh = r.data["refresh"]

        # 2) logout with auth header + refresh in body
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        r2 = self.client.post(self.logout_url, {"refresh": refresh}, format="json")
        self.assertEqual(r2.status_code, status.HTTP_200_OK)

        # 3) last_logout updated
        self.active_user.refresh_from_db()
        self.assertIsNotNone(self.active_user.last_logout)

        # 4) refresh token blacklisted in DB
        # вќ—пёЏРЅРµР»СЊР·СЏ РґРµР»Р°С‚СЊ RefreshToken(refresh) вЂ” РѕРЅ РїСЂРѕРІРµСЂРёС‚ blacklist Рё СѓРїР°РґРµС‚
        payload = token_backend.decode(refresh, verify=True)  # РїРѕРґРїРёСЃСЊ/exp РѕРє, blacklist РЅРµ С‚СЂРѕРіР°РµРј
        jti = payload["jti"]
        self.assertTrue(
            BlacklistedToken.objects.filter(token__jti=jti).exists(),
            "Refresh token was not blacklisted",
        )

    def test_blacklisted_refresh_cannot_refresh(self):
        # login -> logout (blacklist) -> refresh should 401
        r = self.client.post(
            self.login_url,
            {"email": self.active_user.email, "password": self.password},
            format="json",
        )
        access = r.data["access"]
        refresh = r.data["refresh"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        self.client.post(self.logout_url, {"refresh": refresh}, format="json")

        self.client.credentials()  # refresh РѕР±С‹С‡РЅРѕ Р±РµР· access
        r3 = self.client.post(self.refresh_url, {"refresh": refresh}, format="json")
        self.assertEqual(r3.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_for_deleted_user_returns_401_instead_of_500(self):
        refresh = str(RefreshToken.for_user(self.active_user))
        self.active_user.delete()

        response = self.client.post(
            self.refresh_url,
            {"refresh": refresh},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
