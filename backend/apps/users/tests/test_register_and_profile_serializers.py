# apps/users/tests/test_register_and_profile_serializers.py
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.users.models import ProfileModel, UserStatsModel
from apps.users.serializers import (
    UserRegisterSerializer,
    ProfileSerializer,
)
from apps.users.user_registration_service import UserRegistrationService

User = get_user_model()


class UserRegisterSerializerTests(TestCase):
    def _create_user_with_profile(
        self,
        email: str,
        display_name: str,
        name: str = "Test Name",
        is_active: bool = True,
    ) -> User:
        """
        РЈС‚РёР»РёС‚Р° РґР»СЏ СЃРѕР·РґР°РЅРёСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ, СЃРІСЏР·Р°РЅРЅРѕРіРѕ РїСЂРѕС„РёР»СЏ Рё СЃС‚Р°С‚С‹ вЂ“ РїСЂРёРіРѕРґРёС‚СЃСЏ
        РІ С‚РµСЃС‚Р°С… СѓРЅРёРєР°Р»СЊРЅРѕСЃС‚Рё Рё РїСЂ.
        """
        user = User(email=email, is_active=is_active)
        user.set_password("Testpass123!")
        user.save()

        ProfileModel.objects.create(
            user=user,
            name=name,
            display_name=display_name,
        )
        UserStatsModel.objects.create(user=user)

        return user

    def test_successful_registration_creates_all_related_objects_and_sends_email(self):
        """
        РЈСЃРїРµС€РЅР°СЏ СЂРµРіРёСЃС‚СЂР°С†РёСЏ:
        - СЃРѕР·РґР°С‘С‚СЃСЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ
        - СЃРѕР·РґР°С‘С‚СЃСЏ ProfileModel Рё UserStatsModel
        - РІС‹Р·С‹РІР°РµС‚СЃСЏ EmailService.register(user)
        """
        data = {
            "email": "newuser@example.com",
            "password": "Tpg$12345!",
            "profile": {
                "name": "New User",
                "display_name": "NewUserNick",
            },
            "terms_accepted": True,
        }

        ser = UserRegisterSerializer(data=data)
        self.assertTrue(ser.is_valid(), ser.errors)

        with patch(
            "apps.users.user_registration_service.EmailService.register"
        ) as register_email:
            with self.captureOnCommitCallbacks(execute=True):
                user = UserRegistrationService.register(ser.validated_data)

        # РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ СЋР·РµСЂ РґРµР№СЃС‚РІРёС‚РµР»СЊРЅРѕ СЃРѕР·РґР°РЅ
        self.assertIsInstance(user, User)
        self.assertTrue(User.objects.filter(email="newuser@example.com").exists())

        # РџСЂРѕС„РёР»СЊ
        profile = ProfileModel.objects.get(user=user)
        self.assertEqual(profile.display_name, "NewUserNick")

        # РЎС‚Р°С‚С‹
        self.assertTrue(UserStatsModel.objects.filter(user=user).exists())

        register_email.assert_called_once_with(user)

    def test_validate_email_rejects_duplicate_email_case_insensitive(self):
        """
        validate_email РґРѕР»Р¶РµРЅ РѕС‚РєР»РѕРЅРёС‚СЊ email, РµСЃР»Рё РѕРЅ СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓРµС‚ (Р±РµР· СѓС‡С‘С‚Р° СЂРµРіРёСЃС‚СЂР°).
        """
        existing = self._create_user_with_profile(
            "existing@example.com",
            display_name="ExistingNick",
        )

        data = {
            "email": "Existing@Example.Com",  # РґСЂСѓРіРѕР№ СЂРµРіРёСЃС‚СЂ
            "password": "Tpg$12345!",
            "profile": {
                "name": "Another",
                "display_name": "AnotherNick",
            },
            "terms_accepted": True,
        }

        ser = UserRegisterSerializer(data=data)
        self.assertFalse(ser.is_valid())
        self.assertIn("email", ser.errors)
        self.assertIn("A user with this email already exists.", ser.errors["email"][0])


class ProfileSerializerTests(TestCase):
    def _create_user_with_profile(
        self,
        email: str,
        display_name: str,
        name: str = "Name",
        is_active: bool = True,
    ) -> User:
        user = User(email=email, is_active=is_active)
        user.set_password("Testpass123!")
        user.save()
        ProfileModel.objects.create(
            user=user,
            name=name,
            display_name=display_name,
        )
        return user

    def test_profile_serializer_allows_own_display_name_on_update(self):
        """
        РџСЂРё РѕР±РЅРѕРІР»РµРЅРёРё РїСЂРѕС„РёР»СЏ РјРѕР¶РЅРѕ РїРµСЂРµРґР°С‚СЊ СЃРІРѕР№ Р¶Рµ display_name вЂ”
        РІР°Р»РёРґР°С‚РѕСЂ РЅРµ РґРѕР»Р¶РµРЅ СЂСѓРіР°С‚СЊСЃСЏ РЅР° 'This display name is already taken.'.
        """
        user = self._create_user_with_profile(
            "u1@example.com",
            display_name="MyNick",
        )
        profile = user.profile

        ser = ProfileSerializer(
            instance=profile,
            data={"display_name": "MyNick"},
            partial=True,
        )
        self.assertTrue(ser.is_valid(), ser.errors)
        self.assertEqual(ser.validated_data["display_name"], profile.display_name)

    def test_profile_serializer_rejects_duplicate_display_name(self):
        """
        Р•СЃР»Рё РґСЂСѓРіРѕР№ РїСЂРѕС„РёР»СЊ СѓР¶Рµ РёСЃРїРѕР»СЊР·СѓРµС‚ С‚Р°РєРѕР№ Р¶Рµ display_name (С‡РµСЂРµР· display_name_ci),
        РґРѕР»Р¶РЅР° Р±С‹С‚СЊ РѕС€РёР±РєР° 'This display name is already taken.'.
        """
        u1 = self._create_user_with_profile(
            "u1@example.com",
            display_name="MyNick",
        )
        u2 = self._create_user_with_profile(
            "u2@example.com",
            display_name="OtherNick",
        )

        profile2 = u2.profile

        ser = ProfileSerializer(
            instance=profile2,
            data={"display_name": "MyNick"},
            partial=True,
        )
        self.assertFalse(ser.is_valid())
        self.assertIn("display_name", ser.errors)
        self.assertIn("This display name is already taken.", ser.errors["display_name"][0])
