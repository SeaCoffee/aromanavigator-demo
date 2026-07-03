from django.test import TestCase
from django.contrib.auth import get_user_model

from apps.users.models import ProfileModel
from backend.apps.users.display_name_service import make_base_display_name, make_unique_display_name
from core.validators.profile_validators import validate_display_name

UserModel = get_user_model()


class DisplayNameServiceTests(TestCase):
    def test_make_base_display_name_normalizes_and_valid(self):
        v = make_base_display_name("  Test User  ")

        # РїСЂРѕР±РµР»С‹ РґРѕР»Р¶РЅС‹ Р±С‹С‚СЊ СѓР±СЂР°РЅС‹
        self.assertNotIn(" ", v)

        # РґРѕР»Р¶РµРЅ РїСЂРѕС…РѕРґРёС‚СЊ РѕР±С‰РёР№ РІР°Р»РёРґР°С‚РѕСЂ
        self.assertEqual(validate_display_name(v), v)

    def test_make_unique_display_name_adds_suffix_when_taken(self):
        # СЃРѕР·РґР°С‘Рј СѓР¶Рµ Р·Р°РЅСЏС‚С‹Р№ display_name
        user1 = UserModel.objects.create_user(email="a@a.com", password="x")
        ProfileModel.objects.create(user=user1, name="A", display_name="testuser")

        dn = make_unique_display_name("testuser")

        self.assertNotEqual(dn, "testuser")
        self.assertTrue(dn.startswith("testuser-"))

    def test_make_unique_display_name_respects_max_len(self):
        base = "a" * 40
        dn = make_unique_display_name(base)

        max_len = ProfileModel._meta.get_field("display_name").max_length
        self.assertLessEqual(len(dn), max_len)
        self.assertEqual(validate_display_name(dn), dn)
