from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.display_name_service import make_base_display_name
from apps.users.models import ProfileModel, UserStatsModel


User = get_user_model()


class DisplayNameContractTests(APITestCase):
    def test_generated_reserved_display_name_falls_back_to_neutral_name(self):
        self.assertEqual(make_base_display_name("Admin Support"), "user")


class UserRegistrationContractTests(APITestCase):
    def setUp(self):
        self.url = reverse("user_create")
        self.payload = {
            "email": "new-user@example.com",
            "password": "StrongPass123!",
            "profile": {
                "name": "New User",
                "display_name": "NewUser",
                "region": "kyiv_region",
            },
            "terms_accepted": True,
        }

    @patch("apps.users.user_registration_service.EmailService.register")
    def test_registration_creates_required_user_state(self, register_email):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(self.url, self.payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        user = User.objects.get(email=self.payload["email"])
        self.assertFalse(user.is_active)
        self.assertEqual(user.profile.display_name, "NewUser")
        self.assertEqual(user.profile.region, "kyiv_region")
        self.assertTrue(UserStatsModel.objects.filter(user=user).exists())
        register_email.assert_called_once_with(user)

    def test_duplicate_email_is_field_error(self):
        existing = User.objects.create_user(
            email="existing@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        ProfileModel.objects.create(
            user=existing,
            name="Existing",
            display_name="ExistingUser",
        )
        payload = {
            **self.payload,
            "email": "EXISTING@example.com",
            "profile": {
                **self.payload["profile"],
                "display_name": "existinguser",
            },
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)

    def test_duplicate_display_name_is_nested_field_error(self):
        existing = User.objects.create_user(
            email="display-name-owner@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        ProfileModel.objects.create(
            user=existing,
            name="Existing",
            display_name="ExistingUser",
        )
        payload = {
            **self.payload,
            "email": "fresh-email@example.com",
            "profile": {
                **self.payload["profile"],
                "display_name": "existinguser",
            },
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("display_name", response.data["profile"])

    def test_reserved_staff_display_name_is_rejected(self):
        payload = {
            **self.payload,
            "profile": {
                **self.payload["profile"],
                "display_name": "admin_user",
            },
        }

        response = self.client.post(self.url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("display_name", response.data["profile"])


class UserProfileUpdateContractTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="profile@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        self.profile = ProfileModel.objects.create(
            user=self.user,
            name="Profile",
            display_name="ProfileUser",
        )
        self.url = reverse("user_update_self")
        self.client.force_authenticate(user=self.user)

    def test_duplicate_display_name_is_nested_field_error(self):
        other = User.objects.create_user(
            email="other-profile@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        ProfileModel.objects.create(
            user=other,
            name="Other",
            display_name="TakenName",
        )

        response = self.client.patch(
            self.url,
            {"profile": {"display_name": "takenname"}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("profile", response.data)
        self.assertIn("display_name", response.data["profile"])
