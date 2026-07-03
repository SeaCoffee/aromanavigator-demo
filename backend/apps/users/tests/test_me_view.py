# apps/users/tests/test_me_view.py
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import ProfileModel, UserStatsModel

User = get_user_model()


class MeViewTests(APITestCase):
    def _create_user_full(self, email: str, *, is_active=True):
        user = User(email=email, is_active=is_active)
        user.set_password("Testpass123!")
        user.save()
        ProfileModel.objects.create(
            user=user,
            name="User Name",
            display_name=f"user{user.pk}",
        )
        UserStatsModel.objects.create(user=user)
        return user

    def test_me_requires_auth(self):
        url = reverse("users-me")
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_current_user(self):
        user = self._create_user_full("me@example.com")
        self.client.force_authenticate(user=user)

        url = reverse("users-me")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["id"], user.id)
        self.assertEqual(resp.data["email"], user.email)
        self.assertIn("profile", resp.data)
        self.assertIn("stats", resp.data)

    def test_not_suspended_user(self):
        user = self._create_user_full("a@example.com")
        self.client.force_authenticate(user=user)

        url = reverse("users-me")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data["is_suspended"])
        self.assertEqual(resp.data["suspension_seconds_left"], 0)

    def test_future_suspended_user(self):
        """
        Р•СЃР»Рё suspended_until РІ Р±СѓРґСѓС‰РµРј:
        - is_suspended=True
        - seconds_left > 0
        """
        user = self._create_user_full("b@example.com")
        user.suspended_until = timezone.now() + timedelta(hours=1)
        user.save()

        self.client.force_authenticate(user=user)

        url = reverse("users-me")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.data["is_suspended"])
        self.assertGreater(resp.data["suspension_seconds_left"], 0)

    def test_past_suspended_user(self):
        """
        Р•СЃР»Рё suspended_until СѓР¶Рµ РїСЂРѕС€Р»Рѕ:
        - is_suspended=False
        - seconds_left РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ 0, Р° РЅРµ РѕС‚СЂРёС†Р°С‚РµР»СЊРЅС‹Рј
        """
        user = self._create_user_full("c@example.com")
        user.suspended_until = timezone.now() - timedelta(seconds=5)
        user.save()

        self.client.force_authenticate(user=user)

        url = reverse("users-me")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, 200)
        self.assertFalse(resp.data["is_suspended"])
        self.assertEqual(resp.data["suspension_seconds_left"], 0)
