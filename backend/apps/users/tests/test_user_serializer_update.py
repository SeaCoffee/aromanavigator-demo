# apps/users/tests/test_user_serializer_update.py
from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.test import TestCase

from apps.users.models import ProfileModel, UserStatsModel
from apps.users.serializers import UserSerializer
from rest_framework import serializers

User = get_user_model()


class UserSerializerUpdateTests(TestCase):
    def _create_user_full(
        self,
        email: str,
        *,
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
        UserStatsModel.objects.create(user=user)
        return user

    def test_update_user_password_and_profile_success(self):
        """
        UserSerializer.update:
        - РѕР±РЅРѕРІР»СЏРµС‚ email
        - РјРµРЅСЏРµС‚ РїР°СЂРѕР»СЊ С‡РµСЂРµР· set_password (РїСЂРѕРІРµСЂСЏРµРј check_password)
        - РѕР±РЅРѕРІР»СЏРµС‚ РІР»РѕР¶РµРЅРЅС‹Р№ profile (РЅР°РїСЂРёРјРµСЂ, name)
        """
        user = self._create_user_full(
            "old@example.com",
            display_name="OldNick",
        )

        serializer = UserSerializer()

        validated_data = {
            "email": "new@example.com",
            "password": "NewPass123!",
            "profile": {
                "name": "New Name",
            },
        }

        updated = serializer.update(user, validated_data)

        updated.refresh_from_db()
        updated.profile.refresh_from_db()

        self.assertEqual(updated.email, "new@example.com")
        self.assertTrue(updated.check_password("NewPass123!"))
        self.assertEqual(updated.profile.name, "New Name")

    def test_update_integrity_error_maps_to_field_errors(self):
        """
        Р•СЃР»Рё РїСЂРё СЃРѕС…СЂР°РЅРµРЅРёРё РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ СЃР»СѓС‡РёР»СЃСЏ IntegrityError
        (РЅР°РїСЂРёРјРµСЂ, РёР·-Р·Р° СѓРЅРёРєР°Р»СЊРЅРѕСЃС‚Рё email Рё display_name),
        UserSerializer.update РґРѕР»Р¶РµРЅ РѕР±РµСЂРЅСѓС‚СЊ СЌС‚Рѕ РІ serializers.ValidationError
        СЃ РїРѕР»СЏРјРё:
            - email: ["A user with this email already exists."]
            - profile: { "display_name": ["This display name is already taken."] }
        """
        # Р®Р·РµСЂ, РЅР° РєРѕС‚РѕСЂРѕРіРѕ "РЅР°С‚С‹РєР°РµС‚СЃСЏ" СѓРЅРёРєР°Р»СЊРЅРѕСЃС‚СЊ
        existing = self._create_user_full(
            "existing@example.com",
            display_name="ExistingNick",
        )

        # Р®Р·РµСЂ, РєРѕС‚РѕСЂРѕРіРѕ РѕР±РЅРѕРІР»СЏРµРј
        target = self._create_user_full(
            "other@example.com",
            display_name="OtherNick",
        )

        serializer = UserSerializer()

        validated_data = {
            "email": "existing@example.com",  # РєРѕРЅС„Р»РёРєС‚ РїРѕ email
            "profile": {
                "display_name": "ExistingNick",  # РєРѕРЅС„Р»РёРєС‚ РїРѕ display_name
            },
        }

        # РџР°С‚С‡РёРј save Сѓ РјРѕРґРµР»Рё User, С‡С‚РѕР±С‹ РѕРЅ РєРёРґР°Р» IntegrityError РїСЂРё РїРѕРїС‹С‚РєРµ СЃРѕС…СЂР°РЅРёС‚СЊ.
        with patch.object(User, "save", side_effect=IntegrityError("duplicate")):
            with self.assertRaises(serializers.ValidationError) as ctx:
                serializer.update(target, validated_data)

        exc = ctx.exception
        detail = exc.detail

        # РѕР¶РёРґР°РµРј СЃС‚СЂСѓРєС‚СѓСЂСѓ РѕС€РёР±РѕРє
        self.assertIn("email", detail)
        self.assertIn("A user with this email already exists.", detail["email"][0])

        self.assertIn("profile", detail)
        self.assertIn("display_name", detail["profile"])
        self.assertIn(
            "This display name is already taken.",
            detail["profile"]["display_name"][0],
        )
