from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from unittest.mock import patch

User = get_user_model()


class ChangePasswordTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_change_password_ok_returns_204_and_changes_password(self):
        user = User.objects.create_user(email="a@a.com", password="OldPass123!", is_active=True)

        # Р°СѓС‚РµРЅС‚РёС„РёРєР°С†РёСЏ Р±РµР· JWT (С‡РёСЃС‚Рѕ РґР»СЏ Р±СЌРєРµРЅРґ-С‚РµСЃС‚Р°)
        self.client.force_authenticate(user=user)

        url = reverse("user_change_password")

        resp = self.client.post(
            url,
            {"old_password": "OldPass123!", "new_password": "NewPass123!@"},
            format="json",
        )

        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data["detail"], "РџР°СЂРѕР»СЊ СѓСЃРїС–С€РЅРѕ Р·РјС–РЅРµРЅРѕ.")

        user.refresh_from_db()
        self.assertTrue(user.check_password("NewPass123!@"))

    def test_change_password_wrong_old_password_returns_400(self):
        user = User.objects.create_user(email="b@b.com", password="OldPass123!", is_active=True)
        self.client.force_authenticate(user=user)

        url = reverse("user_change_password")

        resp = self.client.post(
            url,
            {"old_password": "WRONG", "new_password": "NewPass123!@"},
            format="json",
        )

        self.assertEqual(resp.status_code, 400)
        self.assertIn("old_password", resp.json())

        user.refresh_from_db()
        self.assertTrue(user.check_password("OldPass123!"))

    def test_change_password_rejects_same_password(self):
        user = User.objects.create_user(email="c@c.com", password="OldPass123!", is_active=True)
        self.client.force_authenticate(user=user)

        url = reverse("user_change_password")

        resp = self.client.post(
            url,
            {"old_password": "OldPass123!", "new_password": "OldPass123!"},
            format="json",
        )

        self.assertEqual(resp.status_code, 400)
        self.assertIn("new_password", resp.json())


class PasswordSetupTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("user_password_setup")

    def test_anonymous_user_cannot_request_password_setup(self):
        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, 401)

    @patch("apps.users.user_password_service.EmailService.recovery")
    def test_oauth_user_can_request_password_setup(self, recovery):
        user = User.objects.create_user(
            email="oauth@example.com",
            password=None,
            is_active=True,
            email_verified=True,
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, 200)
        recovery.assert_called_once_with(user)

    @patch("apps.users.user_password_service.EmailService.recovery")
    def test_user_with_password_cannot_request_password_setup(self, recovery):
        user = User.objects.create_user(
            email="password@example.com",
            password="OldPass123!",
            is_active=True,
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(self.url, {}, format="json")

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.json())
        recovery.assert_not_called()

    def test_change_password_requires_fields(self):
        user = User.objects.create_user(email="d@d.com", password="OldPass123!", is_active=True)
        self.client.force_authenticate(user=user)

        url = reverse("user_change_password")

        resp = self.client.post(url, {}, format="json")
        self.assertEqual(resp.status_code, 400)
        data = resp.json()
        self.assertIn("old_password", data)
        self.assertIn("new_password", data)

    def test_change_password_validates_password_rules(self):
        user = User.objects.create_user(email="e@e.com", password="OldPass123!", is_active=True)
        self.client.force_authenticate(user=user)

        url = reverse("user_change_password")

        # Р·Р°РІРµРґРѕРјРѕ СЃР»Р°Р±С‹Р№ РїР°СЂРѕР»СЊ (РїРѕРґ С‚РІРѕРё РїСЂР°РІРёР»Р°)
        resp = self.client.post(
            url,
            {"old_password": "OldPass123!", "new_password": "short"},
            format="json",
        )
        self.assertEqual(resp.status_code, 400)
        self.assertIn("new_password", resp.json())
