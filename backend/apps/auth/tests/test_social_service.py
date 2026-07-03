# apps/auth/test/test_social_service.py
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from apps.users.models import SocialAccountModel, ProfileModel, UserStatsModel
from core.choises.social_providers_choise import SocialProvider

from apps.auth.social_auth_service import get_or_create_user_from_google


UserModel = get_user_model()


class SocialServiceTests(TestCase):
    def test_social_first_login_creates_all_related(self):
        user, created_link = get_or_create_user_from_google(
            provider_user_id="google-sub-1",
            email="test@example.com",
            name="Test User",
            email_verified=True,
        )

        self.assertIs(created_link, True)
        self.assertEqual(user.email.lower(), "test@example.com")
        self.assertIs(user.is_active, True)

        self.assertTrue(ProfileModel.objects.filter(user=user).exists())
        self.assertTrue(UserStatsModel.objects.filter(user=user).exists())

        self.assertTrue(
            SocialAccountModel.objects.filter(
                provider=SocialProvider.GOOGLE,
                provider_user_id="google-sub-1",
                user=user,
            ).exists()
        )

        profile = ProfileModel.objects.get(user=user)
        self.assertTrue(profile.display_name)
        self.assertEqual(profile.display_name_ci, profile.display_name.strip().lower())

    def test_social_repeat_login_does_not_duplicate(self):
        user1, created1 = get_or_create_user_from_google(
            provider_user_id="google-sub-2",
            email="repeat@example.com",
            name="Repeat",
            email_verified=True,
        )
        user2, created2 = get_or_create_user_from_google(
            provider_user_id="google-sub-2",
            email="repeat@example.com",
            name="Repeat",
            email_verified=True,
        )

        self.assertEqual(user1.id, user2.id)
        self.assertIs(created1, True)
        self.assertIs(created2, False)

        self.assertEqual(
            SocialAccountModel.objects.filter(
                provider=SocialProvider.GOOGLE,
                provider_user_id="google-sub-2",
            ).count(),
            1,
        )
        self.assertEqual(ProfileModel.objects.filter(user=user1).count(), 1)
        self.assertEqual(UserStatsModel.objects.filter(user=user1).count(), 1)

    def test_social_links_existing_user_by_email(self):
        u = UserModel.objects.create_user(email="link@example.com", password=None)
        u.is_active = True
        u.save(update_fields=["is_active"])

        user, created_link = get_or_create_user_from_google(
            provider_user_id="google-sub-3",
            email="link@example.com",
            name="Link",
            email_verified=True,
        )

        self.assertEqual(user.id, u.id)
        self.assertIs(created_link, True)  # created_link (СЃРѕР·РґР°Р»Рё social link)

        self.assertTrue(
            SocialAccountModel.objects.filter(
                provider=SocialProvider.GOOGLE,
                provider_user_id="google-sub-3",
                user=u,
            ).exists()
        )

    def test_social_repeat_login_keeps_suspended_user_suspended(self):
        u = UserModel.objects.create_user(email="blocked@example.com", password=None)
        u.is_active = True
        u.suspended_until = timezone.now() + timedelta(days=1)
        u.save(update_fields=["is_active", "suspended_until"])

        SocialAccountModel.objects.create(
            provider=SocialProvider.GOOGLE,
            provider_user_id="google-sub-blocked",
            user=u,
            email="blocked@example.com",
        )

        user, created = get_or_create_user_from_google(
            provider_user_id="google-sub-blocked",
            email="blocked@example.com",
            name="Blocked",
            email_verified=True,
        )

        self.assertEqual(user.id, u.id)
        self.assertFalse(created)
        self.assertTrue(user.is_suspended)
