# apps/users/tests/test_user_retrieve_view.py
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class UserRetrieveViewTests(APITestCase):
    def _create_user(self, email: str, password: str = "Testpass123!", **extra):
        user = User(email=email, **extra)
        user.set_password(password)
        user.save()
        return user

    def test_retrieve_by_pk(self):
        """
        Р•СЃР»Рё lookup_value вЂ” С‚РѕР»СЊРєРѕ С†РёС„СЂС‹ в†’ РёС‰РµРј РїРѕ PK.
        """
        user = self._create_user("me@example.com", is_active=True, is_staff=True)
        other = self._create_user("target@example.com", is_active=True)

        self.client.force_authenticate(user=user)

        url = reverse("user_detail", args=[str(other.id)])  # numeric lookup
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assertEqual(resp.data["id"], other.id)
        self.assertEqual(resp.data["email"], "target@example.com")

    def test_retrieve_by_email_case_insensitive(self):
        """
        Р•СЃР»Рё lookup_value РЅРµ С†РµР»РёРєРѕРј С†РёС„СЂС‹ в†’ РёС‰РµРј РїРѕ email__iexact.
        """
        user = self._create_user("me@example.com", is_active=True, is_staff=True)
        other = self._create_user("target@example.com", is_active=True)

        self.client.force_authenticate(user=user)

        url = reverse("user_detail", args=["TARGET@EXAMPLE.COM"])  # upper case
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assertEqual(resp.data["id"], other.id)
        self.assertEqual(resp.data["email"], "target@example.com")

    def test_not_found(self):
        """
        Р•СЃР»Рё СЋР·РµСЂ РѕС‚СЃСѓС‚СЃС‚РІСѓРµС‚ в†’ СЃС‚Р°С‚СѓСЃ 404, С‚РµРєСЃС‚ 'User not found'.
        """
        user = self._create_user("me@example.com", is_active=True, is_staff=True)
        self.client.force_authenticate(user=user)

        url = reverse("user_detail", args=["nosuch@example.com"])
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("User not found", str(resp.data))
