from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from unittest.mock import patch

User = get_user_model()


class RecoveryApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    @patch("core.common_services.email_service.EmailService.recovery")
    def test_recovery_request_always_200(self, recovery_mock):
        User.objects.create_user(
            email="user@example.com",
            password="OldPass123!",
            is_active=True,
        )

        resp1 = self.client.post(
            "/userApi/auth/recovery",
            {"email": "user@example.com"},
            format="json",
        )
        self.assertEqual(resp1.status_code, 200)

        resp2 = self.client.post(
            "/userApi/auth/recovery",
            {"email": "missing@example.com"},
            format="json",
        )
        self.assertEqual(resp2.status_code, 200)

        self.assertEqual(recovery_mock.call_count, 1)

    @patch("core.common_services.jwt_service.JWTService.verify_action_token")
    def test_recovery_reset_changes_password_and_activates(self, verify_mock):
        user = User.objects.create_user(
            email="user2@example.com",
            password="OldPass123!",
            is_active=False,
        )
        verify_mock.return_value = user

        new_password = "NewPass123!"
        token = "dummy-token"

        # вњ… Р’РђР–РќРћ: Р±РµР· "/api"
        response = self.client.post(
            f"/userApi/auth/recovery/{token}",
            {"password": new_password},
            format="json",
        )

        # рџ”Ћ Р”РёР°РіРЅРѕСЃС‚РёРєР°, РµСЃР»Рё РЅРµ 200
        if response.status_code != 200:
            print("STATUS:", response.status_code)
            try:
                print("JSON:", response.json())
            except Exception:
                print("BODY:", response.content.decode("utf-8", errors="ignore"))

        self.assertEqual(response.status_code, 200)

        user.refresh_from_db()
        self.assertTrue(user.check_password(new_password))
        self.assertTrue(user.is_active)

        # вњ… РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ РїР°С‚С‡ СЂРµР°Р»СЊРЅРѕ СЃСЂР°Р±РѕС‚Р°Р» Рё consume=True
        self.assertTrue(verify_mock.called, "verify_action_token was not called (patch path wrong?)")
        args, kwargs = verify_mock.call_args
        self.assertEqual(args[0], token)
        self.assertTrue(kwargs.get("consume") is True)

    @patch("core.common_services.jwt_service.JWTService.verify_action_token")
    def test_recovery_reset_rejects_current_password(self, verify_mock):
        user = User.objects.create_user(
            email="same-password@example.com",
            password="OldPass123!",
            is_active=True,
        )
        verify_mock.return_value = user

        response = self.client.post(
            "/userApi/auth/recovery/dummy-token",
            {"password": "OldPass123!"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("password", response.json())
