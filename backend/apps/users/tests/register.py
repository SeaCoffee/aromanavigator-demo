from unittest.mock import patch

from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import ProfileModel, UserStatsModel
from apps.users.views import UserCreateView

UserModel = get_user_model()


class RegisterTests(APITestCase):
    """
    РўРµСЃС‚РёСЂСѓРµРј СЂРµРіРёСЃС‚СЂР°С†РёСЋ РєР°Рє РєРѕРЅС‚СЂР°РєС‚ API:
    - СѓСЃРїРµС€РЅР°СЏ СЂРµРіРёСЃС‚СЂР°С†РёСЏ
    - РґСѓР±Р»РёРєР°С‚ email
    - РґСѓР±Р»РёРєР°С‚ display_name
    - РїР»РѕС…РѕР№ РїР°СЂРѕР»СЊ
    - РїР»РѕС…РѕРµ РёРјСЏ
    """

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._user_create_throttle_classes = UserCreateView.throttle_classes
        UserCreateView.throttle_classes = []

    @classmethod
    def tearDownClass(cls):
        UserCreateView.throttle_classes = cls._user_create_throttle_classes
        super().tearDownClass()

    # вљ пёЏ РџРѕСЃС‚Р°РІСЊ СЃСЋРґР° СЂРµР°Р»СЊРЅС‹Р№ url name С‚РІРѕРµРіРѕ СЌРЅРґРїРѕРёРЅС‚Р° СЂРµРіРёСЃС‚СЂР°С†РёРё
    # Р•СЃР»Рё Сѓ С‚РµР±СЏ path("users/register", UserCreateView.as_view(), name="user-register")
    # С‚Рѕ РѕСЃС‚Р°РІСЊ "user-register".
    REGISTER_URL_NAME = "user_create"


    def register_url(self) -> str:
        return reverse(self.REGISTER_URL_NAME)

    def payload(self, **overrides):
        base = {
            "email": "test@example.com",
            "password": "Aroma2026!",
            "profile": {
                "name": "Oksana",
                "display_name": "oksana_123",
                "region": "kyiv_city"
            },
            "terms_accepted": True,
        }
        # РїРѕРІРµСЂС…РЅРѕСЃС‚РЅС‹Р№ merge
        base.update({k: v for k, v in overrides.items() if k != "profile"})
        if "profile" in overrides:
            base["profile"].update(overrides["profile"])
        return base

    def test_register_success(self):
        resp = self.client.post(self.register_url(), data=self.payload(), format="json")
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)

        # РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃРѕР·РґР°РЅ
        self.assertTrue(UserModel.objects.filter(email__iexact="test@example.com").exists())

        user = UserModel.objects.get(email__iexact="test@example.com")
        self.assertTrue(ProfileModel.objects.filter(user=user).exists())

        # РїР°СЂРѕР»СЊ РЅРµ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РІ РѕС‚РІРµС‚Рµ (РІР°Р¶РЅРѕ!)
        self.assertNotIn("password", resp.data)

        # РІ РѕС‚РІРµС‚Рµ РѕР¶РёРґР°РµРј С…РѕС‚СЏ Р±С‹ id+email+profile
        self.assertIn("id", resp.data)
        self.assertIn("email", resp.data)
        self.assertIn("profile", resp.data)

    def test_register_duplicate_email_returns_email_field_error(self):
        # Р·Р°СЂР°РЅРµРµ СЃРѕР·РґР°С‘Рј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
        user = UserModel.objects.create_user(
            email="test@example.com",
            password="Aroma2026!",
            is_active=True,
            email_verified=True,
        )
        ProfileModel.objects.create(user=user, name="Oksana", display_name="someone_else", region="OTHER")

        resp = self.client.post(self.register_url(), data=self.payload(), format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

        # РѕР¶РёРґР°РµРј РїРѕР»РµРІСѓСЋ РѕС€РёР±РєСѓ email
        self.assertIn("email", resp.data)
        self.assertIsInstance(resp.data["email"], list)

    @patch("apps.users.user_registration_service.EmailService.register")
    def test_register_pending_unverified_email_refreshes_account_and_resends_email(
        self,
        register_email,
    ):
        user = UserModel.objects.create_user(
            email="test@example.com",
            password="OldPass2026!",
            is_active=False,
            email_verified=False,
        )
        ProfileModel.objects.create(
            user=user,
            name="Old Name",
            display_name="old_pending",
            region="other",
        )
        UserStatsModel.objects.create(user=user)

        with self.captureOnCommitCallbacks(execute=True):
            resp = self.client.post(
                self.register_url(),
                data=self.payload(
                    password="NewPass2026!",
                    profile={
                        "name": "Fresh Name",
                        "display_name": "fresh_pending",
                        "region": "lviv",
                    },
                ),
                format="json",
            )

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED, resp.data)
        self.assertEqual(
            UserModel.objects.filter(email__iexact="test@example.com").count(),
            1,
        )
        self.assertEqual(resp.data["profile"]["name"], "Fresh Name")
        self.assertEqual(resp.data["profile"]["display_name"], "fresh_pending")
        self.assertEqual(resp.data["profile"]["region"], "lviv")

        user.refresh_from_db()
        self.assertTrue(user.check_password("NewPass2026!"))
        self.assertFalse(user.is_active)
        self.assertFalse(user.email_verified)
        self.assertEqual(user.profile.name, "Fresh Name")
        self.assertEqual(user.profile.display_name, "fresh_pending")
        self.assertEqual(user.profile.region, "lviv")
        self.assertTrue(UserStatsModel.objects.filter(user=user).exists())
        register_email.assert_called_once_with(user)

    def test_register_duplicate_display_name_returns_nested_profile_error(self):
        user = UserModel.objects.create_user(email="other@example.com", password="Aroma2026!")
        ProfileModel.objects.create(user=user, name="Petro", display_name="oksana_123", region="OTHER")

        resp = self.client.post(self.register_url(), data=self.payload(), format="json")
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

        # РѕР¶РёРґР°РµРј nested РѕС€РёР±РєСѓ profile.display_name
        self.assertIn("profile", resp.data)
        self.assertIsInstance(resp.data["profile"], dict)
        self.assertIn("display_name", resp.data["profile"])
        self.assertIsInstance(resp.data["profile"]["display_name"], list)


    def test_register_bad_password_returns_password_error(self):
        resp = self.client.post(
            self.register_url(),
            data=self.payload(password="abcdefg!"),  # РЅРµС‚ С†РёС„СЂС‹
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", resp.data)

    def test_register_bad_name_returns_profile_name_error(self):
        resp = self.client.post(
            self.register_url(),
            data=self.payload(profile={"name": " "}),  # РїСѓСЃС‚Рѕ РїРѕСЃР»Рµ trim
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertIn("profile", resp.data)
        self.assertIn("name", resp.data["profile"])

    def test_register_duplicate_display_name_case_insensitive(self):
        # Р’ Р±Р°Р·Рµ СѓР¶Рµ РµСЃС‚СЊ oksana_123
        user = UserModel.objects.create_user(email="other@example.com", password="Aroma2026!")
        ProfileModel.objects.create(user=user, name="Petro", display_name="oksana_123", region="OTHER")

        # РџС‹С‚Р°РµРјСЃСЏ Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊСЃСЏ СЃ С‚РµРј Р¶Рµ display_name, РЅРѕ РєР°РїСЃРѕРј
        resp = self.client.post(
            self.register_url(),
            data=self.payload(profile={"display_name": "OKSANA_123"}),
            format="json",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

        # РѕР¶РёРґР°РµРј nested РѕС€РёР±РєСѓ profile.display_name
        self.assertIn("profile", resp.data)
        self.assertIn("display_name", resp.data["profile"])
        self.assertIsInstance(resp.data["profile"]["display_name"], list)
