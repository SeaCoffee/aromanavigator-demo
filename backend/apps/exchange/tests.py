from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIRequestFactory

from apps.exchange.serializers import ExchangeUserSerializer


User = get_user_model()


class ExchangeStaffPrivacyTests(TestCase):
    def test_staff_is_shown_as_personal_user_in_exchange(self):
        user = User.objects.create_user(
            email="exchange-user@example.com",
            password="password",
        )
        staff = User.objects.create_user(
            email="exchange-staff@example.com",
            password="password",
            is_staff=True,
        )
        request = APIRequestFactory().get("/")
        request.user = user

        payload = ExchangeUserSerializer(
            staff,
            context={"request": request},
        ).data

        self.assertEqual(payload["id"], staff.id)
        self.assertEqual(payload["display_name"], "РљРѕСЂРёСЃС‚СѓРІР°С‡")
        self.assertIsNone(payload["avatar_url"])
