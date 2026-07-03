# apps/users/tests/test_update_self_view.py
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import ProfileModel, UserStatsModel

User = get_user_model()


class UpdateSelfViewTests(APITestCase):
    def _create_user_full(
        self,
        email: str,
        password: str = "Testpass123!",
        *,
        email_verified: bool = False,
        is_active: bool = True,
    ) -> User:
        """
        РЎРѕР·РґР°С‘Рј СЋР·РµСЂР° + profile + stats, С‡С‚РѕР±С‹ UserSerializer СЃРїРѕРєРѕР№РЅРѕ РѕС‚СЂР°Р±Р°С‚С‹РІР°Р».
        """
        user = User(email=email, email_verified=email_verified, is_active=is_active)
        user.set_password(password)
        user.save()

        # Р’РђР–РќРћ: id СѓР¶Рµ РµСЃС‚СЊ С‚РѕР»СЊРєРѕ РїРѕСЃР»Рµ save(), РїРѕСЌС‚РѕРјСѓ РёСЃРїРѕР»СЊР·СѓРµРј user.pk
        ProfileModel.objects.create(
            user=user,
            name="Initial Name",
            display_name=f"user{user.pk}",
        )
        UserStatsModel.objects.create(user=user)

        return user

    def test_update_self_profile_without_email_change(self):
        """
        PATCH /me/update Р±РµР· РёР·РјРµРЅРµРЅРёСЏ email:
        - 200 OK
        - РїСЂРѕС„РёР»СЊ РѕР±РЅРѕРІР»С‘РЅ
        - email РЅРµ РёР·РјРµРЅС‘РЅ
        """
        user = self._create_user_full("user@example.com", email_verified=False, is_active=True)
        self.client.force_authenticate(user=user)

        url = reverse("user_update_self")
        payload = {
            "profile": {
                "name": "New Name",
                # display_name РќР• С‚СЂРѕРіР°РµРј в†’ РЅРµ С‚СЂРёРіРіРµСЂРёРј РїСЂРѕРІРµСЂРєРё/СѓРЅРёРєР°Р»СЊРЅРѕСЃС‚СЊ
            }
        }

        resp = self.client.patch(url, payload, format="json")
        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)

        user.refresh_from_db()
        user.profile.refresh_from_db()

        self.assertEqual(user.email, "user@example.com")
        self.assertEqual(user.profile.name, "New Name")

    def test_cannot_change_verified_email(self):
        """
        Р•СЃР»Рё Сѓ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ email_verified=True Рё РµСЃС‚СЊ email,
        РїРѕРїС‹С‚РєР° СЃРјРµРЅРёС‚СЊ email РґРѕР»Р¶РЅР° РІРµСЂРЅСѓС‚СЊ 400 Рё РќР• РІС‹Р·С‹РІР°С‚СЊ EmailService.start_change.
        """
        user = self._create_user_full("old@example.com", email_verified=True, is_active=True)
        self.client.force_authenticate(user=user)

        url = reverse("user_update_self")
        payload = {
            "email": "new@example.com",
        }

        # РџР°С‚С‡РёРј СЃР°Рј EmailService, Р° РЅРµ РЅРµСЃСѓС‰РµСЃС‚РІСѓСЋС‰РёР№ РјРµС‚РѕРґ start_change.
        with patch("apps.users.views.EmailService") as EmailServiceMock:
            resp = self.client.patch(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST, resp.data)
        self.assertIn("Email change is not allowed once verified", str(resp.data))

        # РЎРµСЂРІРёСЃ РЅРµ РґРѕР»Р¶РµРЅ РІС‹Р·С‹РІР°С‚СЊСЃСЏ
        EmailServiceMock.start_change.assert_not_called()

        user.refresh_from_db()
        self.assertEqual(user.email, "old@example.com")

    def test_change_unverified_email_triggers_email_service_and_returns_400(self):
        """
        Р•СЃР»Рё email РЅРµ РїРѕРґС‚РІРµСЂР¶РґС‘РЅ (email_verified=False), С‚Рѕ:
        - РІС‹Р·С‹РІР°РµС‚СЃСЏ EmailService.start_change(user, new_email)
        - РІРѕР·РІСЂР°С‰Р°РµС‚СЃСЏ 400 СЃ СЃРѕРѕР±С‰РµРЅРёРµРј РїСЂРѕ РѕС‚РїСЂР°РІРєСѓ РїРёСЃСЊРјР°
        - email РІ Р‘Р” РќР• РјРµРЅСЏРµС‚СЃСЏ СЃСЂР°Р·Сѓ
        """
        user = self._create_user_full("old@example.com", email_verified=False, is_active=True)
        self.client.force_authenticate(user=user)

        url = reverse("user_update_self")
        new_email = "new@example.com"
        payload = {
            "email": new_email,
        }

        with patch("apps.users.views.EmailService") as EmailServiceMock:
            resp = self.client.patch(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST, resp.data)
        self.assertIn("We sent a verification link to confirm new email", str(resp.data))

        # РЎРµСЂРІРёСЃ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РІС‹Р·РІР°РЅ СЃ РїСЂР°РІРёР»СЊРЅС‹РјРё Р°СЂРіСѓРјРµРЅС‚Р°РјРё
        EmailServiceMock.start_change.assert_called_once()
        called_user, called_email = EmailServiceMock.start_change.call_args[0]
        self.assertEqual(called_user.id, user.id)
        self.assertEqual(called_email, new_email)

        # Email РІ Р‘Р” РІСЃС‘ РµС‰С‘ СЃС‚Р°СЂС‹Р№ (РјРµРЅСЏРµС‚СЃСЏ С‚РѕР»СЊРєРѕ РїРѕСЃР»Рµ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ)
        user.refresh_from_db()
        self.assertEqual(user.email, "old@example.com")

    def test_me_update_requires_authentication(self):
        """
        РќРµР°РІС‚РѕСЂРёР·РѕРІР°РЅРЅС‹Р№ Р·Р°РїСЂРѕСЃ Рє /me/update в†’ 401.
        """
        url = reverse("user_update_self")
        resp = self.client.patch(url, {}, format="json")

        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)
