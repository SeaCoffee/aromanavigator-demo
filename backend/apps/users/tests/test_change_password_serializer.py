# apps/users/tests/test_change_password_serializer.py
from django.test import TestCase
from rest_framework import serializers

from apps.users.serializers import ChangePasswordSerializer


class ChangePasswordSerializerTests(TestCase):
    def test_new_password_must_be_different_from_old(self):
        """
        Р•СЃР»Рё old_password == new_password в†’ РѕС€РёР±РєР° РїРѕ РїРѕР»СЋ new_password.
        """
        data = {
            "old_password": "Tpg$12345!",
            "new_password": "Tpg$12345!",
        }
        ser = ChangePasswordSerializer(data=data)
        self.assertFalse(ser.is_valid())
        self.assertIn("new_password", ser.errors)
        self.assertIn(
            "РќРѕРІРёР№ РїР°СЂРѕР»СЊ РјР°С” РІС–РґСЂС–Р·РЅСЏС‚РёСЃСЏ РІС–Рґ РїРѕС‚РѕС‡РЅРѕРіРѕ.",
            ser.errors["new_password"][0],
        )

    def test_valid_passwords_pass_validation(self):
        """
        Р•СЃР»Рё old_password != new_password Рё РЅРѕРІС‹Р№ РїР°СЂРѕР»СЊ СѓРґРѕРІР»РµС‚РІРѕСЂСЏРµС‚ validate_password,
        СЃРµСЂРёР°Р»Р°Р№Р·РµСЂ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РІР°Р»РёРґРµРЅ.
        """
        data = {
            "old_password": "Tpg$12345!",
            "new_password": "N3wPass$123",
        }
        ser = ChangePasswordSerializer(data=data)
        self.assertTrue(ser.is_valid(), ser.errors)
        self.assertEqual(ser.validated_data["old_password"], data["old_password"])
        self.assertEqual(ser.validated_data["new_password"], data["new_password"])

    def test_new_password_must_pass_validate_password(self):
        """
        РџСЂРѕРІРµСЂСЏРµРј, С‡С‚Рѕ validate_password СЂРµР°Р»СЊРЅРѕ СЃСЂР°Р±Р°С‚С‹РІР°РµС‚.
        РЇРІРЅРѕ РЅРµРІР°Р»РёРґРЅС‹Р№ РїР°СЂРѕР»СЊ РґРѕР»Р¶РµРЅ РґР°С‚СЊ РѕС€РёР±РєСѓ РїРѕ new_password.
        """
        data = {
            "old_password": "Tpg$12345!",
            "new_password": "short",  # СЃРїРµС†РёР°Р»СЊРЅРѕ РїР»РѕС…РѕР№ РїР°СЂРѕР»СЊ
        }
        ser = ChangePasswordSerializer(data=data)
        self.assertFalse(ser.is_valid())
        self.assertIn("new_password", ser.errors)
        # С‚СѓС‚ РґРѕСЃС‚Р°С‚РѕС‡РЅРѕ РїСЂРѕРІРµСЂРёС‚СЊ, С‡С‚Рѕ РµСЃС‚СЊ С…РѕС‚СЊ РєР°РєРѕРµ-С‚Рѕ СЃРѕРѕР±С‰РµРЅРёРµ РѕР± РѕС€РёР±РєРµ
        self.assertGreater(len(ser.errors["new_password"]), 0)
        self.assertIsInstance(ser.errors["new_password"][0], str)
