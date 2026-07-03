from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from apps.users.models import ProfileModel, UserStatsModel  # РїРѕРїСЂР°РІСЊ РїСѓС‚СЊ, РµСЃР»Рё РЅСѓР¶РµРЅ

UserModel = get_user_model()


class MeViewTests(APITestCase):
    def setUp(self):
        self.user = UserModel.objects.create_user(
            email="test@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        self.profile = ProfileModel.objects.create(
            user=self.user,
            name="Test Name",
            display_name="testname",
            region="UA",
        )
        self.stats = UserStatsModel.objects.create(
            user=self.user,
            followers_count=5,
            notifications_unread_count=2,
        )
        self.url = "/userApi/users/me"

    def test_me_requires_auth(self):
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_returns_current_user_data(self):
        self.client.force_authenticate(user=self.user)

        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.json()
        self.assertEqual(data["id"], self.user.id)
        self.assertEqual(data["email"], self.user.email)
        self.assertTrue(data["is_active"])

        self.assertIn("profile", data)
        self.assertEqual(data["profile"]["name"], self.profile.name)
        self.assertEqual(data["profile"]["display_name"], self.profile.display_name)
        self.assertEqual(data["profile"]["region"], self.profile.region)

        self.assertIn("stats", data)
        self.assertEqual(data["stats"]["followers_count"], self.stats.followers_count)
        self.assertEqual(
            data["stats"]["notifications_unread_count"],
            self.stats.notifications_unread_count,
        )

    def test_me_not_suspended(self):
        # РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ РЅРµ Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅ: РЅРµС‚ РґР°С‚С‹ Р±Р»РѕРєРёСЂРѕРІРєРё
        self.user.suspended_until = None
        self.user.save()

        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.json()
        # РѕР¶РёРґР°РµРј, С‡С‚Рѕ property is_suspended РґР°СЃС‚ False
        self.assertFalse(data["is_suspended"])
        self.assertEqual(data["suspension_seconds_left"], 0)

    def test_me_suspended_in_future(self):
        # Р±Р»РѕРєРёСЂРѕРІРєР° РґРѕ Р±СѓРґСѓС‰РµРіРѕ РІСЂРµРјРµРЅРё
        self.user.suspended_until = timezone.now() + timedelta(hours=1)
        self.user.save()

        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.json()

        # С‚СѓС‚ РјС‹ РёСЃС…РѕРґРёРј РёР· Р»РѕРіРёРєРё property is_suspended:
        # РµСЃР»Рё Сѓ С‚РµР±СЏ РѕРЅ СѓСЃС‚СЂРѕРµРЅ РёРЅР°С‡Рµ вЂ” РїРѕРґРїСЂР°РІСЊ РѕР¶РёРґР°РЅРёРµ
        self.assertTrue(data["is_suspended"])
        self.assertGreaterEqual(data["suspension_seconds_left"], 3500)
        self.assertLessEqual(data["suspension_seconds_left"], 3600)

    def test_me_suspension_expired(self):
        # Р±Р»РѕРєРёСЂРѕРІРєР° СѓР¶Рµ РёСЃС‚РµРєР»Р°
        self.user.suspended_until = timezone.now() - timedelta(minutes=5)
        self.user.save()

        self.client.force_authenticate(user=self.user)
        res = self.client.get(self.url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        data = res.json()

        # РєР°Рє РјРёРЅРёРјСѓРј, РѕСЃС‚Р°РІС€РµРµСЃСЏ РІСЂРµРјСЏ РґРѕР»Р¶РЅРѕ Р±С‹С‚СЊ 0
        self.assertEqual(data["suspension_seconds_left"], 0)
        # Р° С‚СѓС‚ СЃРјРѕС‚СЂРё РїРѕ СЃРІРѕРµР№ Р±РёР·РЅРµСЃ-Р»РѕРіРёРєРµ:
        # РµСЃР»Рё property is_suspended РІРѕР·РІСЂР°С‰Р°РµС‚ False РґР»СЏ РїСЂРѕС€РµРґС€РµР№ РґР°С‚С‹:
        self.assertFalse(data["is_suspended"])
        # РµСЃР»Рё РІРґСЂСѓРі property Сѓ С‚РµР±СЏ СЃС‡РёС‚Р°РµС‚ РёРЅР°С‡Рµ вЂ” РїРѕРјРµРЅСЏР№ РѕР¶РёРґР°РЅРёРµ РЅР° True
