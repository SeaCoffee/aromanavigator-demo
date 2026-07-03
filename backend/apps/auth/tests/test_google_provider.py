# apps/auth/test/test_google_provider.py
from dataclasses import replace
from unittest.mock import patch

from django.test import SimpleTestCase

from apps.auth.exceptions.auth_social_exception import ProviderAuthError, ProviderConfigError
from apps.auth.constants.auth_social_constants import GOOGLE_ISSUERS
from apps.auth.providers.google_provider import verify_google_id_token


class GoogleProviderTests(SimpleTestCase):
    def make_social_auth(self, *, client_id="test-client-id", client_ids=None):
        """
        SOCIAL_AUTH Сѓ С‚РµР±СЏ frozen dataclass, РїРѕСЌС‚РѕРјСѓ:
        - РќР• setattr
        - РґРµР»Р°РµРј РЅРѕРІС‹Р№ РёРЅСЃС‚Р°РЅСЃ С‡РµСЂРµР· dataclasses.replace(...)
        """
        if client_ids is None:
            client_ids = []

        from apps.auth.dataclasses.auth_social_dataclasses import SOCIAL_AUTH
        return replace(
            SOCIAL_AUTH,
            GOOGLE_CLIENT_ID=client_id,
            GOOGLE_CLIENT_IDS=client_ids,
        )

    @patch("apps.auth.providers.google_provider.id_token.verify_oauth2_token")
    def test_verify_google_id_token_ok(self, mock_verify):
        mock_verify.return_value = {
            "sub": "sub-123",
            "iss": list(GOOGLE_ISSUERS)[0],
            "aud": "test-client-id",
            "email": "Test@Example.com",
            "email_verified": True,
            "name": "Test User",
            "picture": "https://example.com/pic.jpg",
        }

        social_auth = self.make_social_auth(client_id="test-client-id", client_ids=[])

        # вњ… РїР°С‚С‡РёРј РѕР±СЉРµРєС‚ SOCIAL_AUTH РІ РјРѕРґСѓР»Рµ РїСЂРѕРІР°Р№РґРµСЂР°
        with patch("apps.auth.providers.google_provider.SOCIAL_AUTH", social_auth):
            data = verify_google_id_token("dummy")

        self.assertEqual(data["provider_user_id"], "sub-123")
        self.assertEqual(data["email"], "Test@Example.com")
        self.assertIs(data["email_verified"], True)
        self.assertEqual(data["name"], "Test User")
        self.assertIn("raw", data)

    def test_verify_google_id_token_no_client_ids(self):
        social_auth = self.make_social_auth(client_id="", client_ids=[])

        with patch("apps.auth.providers.google_provider.SOCIAL_AUTH", social_auth):
            with self.assertRaises(ProviderConfigError):
                verify_google_id_token("dummy")

    @patch("apps.auth.providers.google_provider.id_token.verify_oauth2_token")
    def test_verify_google_id_token_invalid_issuer(self, mock_verify):
        mock_verify.return_value = {
            "sub": "sub-123",
            "iss": "https://evil.example.com",
            "aud": "test-client-id",
        }

        social_auth = self.make_social_auth(client_id="test-client-id", client_ids=[])

        with patch("apps.auth.providers.google_provider.SOCIAL_AUTH", social_auth):
            with self.assertRaises(ProviderAuthError):
                verify_google_id_token("dummy")

    @patch("apps.auth.providers.google_provider.id_token.verify_oauth2_token")
    def test_verify_google_id_token_invalid_aud(self, mock_verify):
        mock_verify.return_value = {
            "sub": "sub-123",
            "iss": list(GOOGLE_ISSUERS)[0],
            "aud": "wrong-client-id",
        }

        social_auth = self.make_social_auth(client_id="test-client-id", client_ids=[])

        with patch("apps.auth.providers.google_provider.SOCIAL_AUTH", social_auth):
            with self.assertRaises(ProviderAuthError):
                verify_google_id_token("dummy")

    @patch("apps.auth.providers.google_provider.id_token.verify_oauth2_token")
    def test_verify_google_id_token_no_sub(self, mock_verify):
        mock_verify.return_value = {
            "iss": list(GOOGLE_ISSUERS)[0],
            "aud": "test-client-id",
        }

        social_auth = self.make_social_auth(client_id="test-client-id", client_ids=[])

        with patch("apps.auth.providers.google_provider.SOCIAL_AUTH", social_auth):
            with self.assertRaises(ProviderAuthError):
                verify_google_id_token("dummy")
