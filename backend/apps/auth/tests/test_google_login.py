# apps/auth/test/test_google_login.py
from unittest.mock import patch

from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from django.conf import settings
from django.test import override_settings

from apps.users.models import ProfileModel, SocialAccountModel, UserStatsModel
from core.choises.social_providers_choise import SocialProvider
from apps.auth.views import GoogleLoginView
from apps.auth.exceptions.auth_social_exception import ProviderAuthError, ProviderConfigError


UserModel = get_user_model()

BASE_RF = getattr(settings, "REST_FRAMEWORK", {})


@override_settings(REST_FRAMEWORK={
    **BASE_RF,
    "DEFAULT_THROTTLE_CLASSES": [],
    "DEFAULT_THROTTLE_RATES": {},
})
class GoogleLoginTests(APITestCase):
    URL_NAME = "auth-google-login"
    VALID_ID_TOKEN = "x" * 10

    def setUp(self):
        super().setUp()
        self._orig_throttle_classes = GoogleLoginView.throttle_classes
        GoogleLoginView.throttle_classes = []

    def tearDown(self):
        GoogleLoginView.throttle_classes = self._orig_throttle_classes
        super().tearDown()

    def url(self) -> str:
        return reverse(self.URL_NAME)

    def post(self, id_token: str):
        return self.client.post(self.url(), data={"id_token": id_token}, format="json")

    def assert_tokens_shape(self, resp):
        self.assertIn("access", resp.data)
        self.assertIn("refresh", resp.data)
        self.assertTrue(resp.data["access"])
        self.assertTrue(resp.data["refresh"])

    def test_google_login_rejects_too_short_id_token(self):
        resp = self.post("dummy")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("id_token", resp.data)

    @patch("apps.auth.social_auth_service.verify_google_id_token")
    def test_google_login_first_time_creates_all_and_returns_tokens(self, mock_verify):
        mock_verify.return_value = {
            "provider_user_id": "sub-first",
            "email": "first@example.com",
            "email_verified": True,
            "name": "First User",
            "picture": None,
            "raw": {},
        }

        resp = self.post(self.VALID_ID_TOKEN)
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assert_tokens_shape(resp)

        user = UserModel.objects.get(email__iexact="first@example.com")

        self.assertTrue(ProfileModel.objects.filter(user=user).exists())
        self.assertTrue(UserStatsModel.objects.filter(user=user).exists())

        self.assertTrue(
            SocialAccountModel.objects.filter(
                provider=SocialProvider.GOOGLE,
                provider_user_id="sub-first",
                user=user,
            ).exists()
        )

        profile = user.profile
        self.assertEqual(profile.display_name_ci, profile.display_name.strip().lower())

    @patch("apps.auth.social_auth_service.verify_google_id_token")
    def test_google_login_returns_400_when_verify_raises_auth_error(self, mock_verify):
        mock_verify.side_effect = ProviderAuthError("bad token")

        resp = self.post(self.VALID_ID_TOKEN)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST, resp.data)
        self.assertIn("id_token", resp.data)
        self.assertIsInstance(resp.data["id_token"], list)

    @patch("apps.auth.social_auth_service.verify_google_id_token")
    def test_google_login_returns_503_when_provider_not_configured(self, mock_verify):
        mock_verify.side_effect = ProviderConfigError("No GOOGLE_CLIENT_ID(S) configured")

        resp = self.post(self.VALID_ID_TOKEN)
        self.assertEqual(resp.status_code, status.HTTP_503_SERVICE_UNAVAILABLE, resp.data)
        self.assertIn("detail", resp.data)

    @patch("apps.auth.social_auth_service.verify_google_id_token")
    def test_google_login_rejects_unverified_email(self, mock_verify):
        mock_verify.return_value = {
            "provider_user_id": "sub-unverified",
            "email": "unverified@example.com",
            "email_verified": False,
            "name": "Unverified User",
        }

        resp = self.post(self.VALID_ID_TOKEN)

        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN, resp.data)
        self.assertFalse(UserModel.objects.filter(email="unverified@example.com").exists())
