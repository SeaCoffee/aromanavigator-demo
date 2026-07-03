from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()


class UserLoginContractTests(APITestCase):
    def setUp(self):
        self.url = reverse("auth-login")
        self.password = "StrongPass123!"
        self.user = User.objects.create_user(
            email="MixedCase@example.com",
            password=self.password,
            is_active=True,
        )

    def test_login_email_is_case_insensitive(self):
        response = self.client.post(
            self.url,
            {
                "email": "mixedcase@EXAMPLE.COM",
                "password": self.password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_invalid_credentials_return_safe_localized_message(self):
        response = self.client.post(
            self.url,
            {
                "email": self.user.email,
                "password": "WrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            str(response.data["detail"]),
            "РќРµРїСЂР°РІРёР»СЊРЅР° РµР»РµРєС‚СЂРѕРЅРЅР° РїРѕС€С‚Р° Р°Р±Рѕ РїР°СЂРѕР»СЊ.",
        )

    def test_inactive_account_uses_same_safe_message(self):
        self.user.is_active = False
        self.user.save(update_fields=["is_active"])

        response = self.client.post(
            self.url,
            {
                "email": self.user.email,
                "password": self.password,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            str(response.data["detail"]),
            "РќРµРїСЂР°РІРёР»СЊРЅР° РµР»РµРєС‚СЂРѕРЅРЅР° РїРѕС€С‚Р° Р°Р±Рѕ РїР°СЂРѕР»СЊ.",
        )
