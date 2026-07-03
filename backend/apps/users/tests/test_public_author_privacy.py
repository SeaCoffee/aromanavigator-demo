from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.activity.serializers import ActivityActorSerializer
from apps.articles.serializers import ArticleAuthorSerializer
from apps.auth.social_auth_service import get_or_create_user_from_google
from apps.exchange.serializers import ExchangeUserSerializer
from apps.favorites.item_serializers import serialize_author
from apps.forum.models import ForumSectionModel, ForumTopicModel
from apps.forum.serializers import ForumTopicSerializer
from apps.users.author_display import (
    public_user_display_name,
    public_user_username,
)
from apps.users.models import ProfileModel
from apps.users.serializers import PublicUserSummarySerializer


User = get_user_model()


class PublicAuthorPrivacyTests(TestCase):
    def test_user_without_profile_never_exposes_email(self):
        user = User.objects.create_user(
            email="private-address@example.com",
            password="Pass12345!",
        )

        self.assertIsNone(public_user_username(user))
        self.assertEqual(public_user_display_name(user), "РљРѕСЂРёСЃС‚СѓРІР°С‡")
        self.assertNotIn("email", ExchangeUserSerializer(user).data)
        self.assertNotIn(
            user.email,
            {
                ArticleAuthorSerializer(user).data["display_name"],
                serialize_author(user)["display_name"],
            },
        )

    def test_public_username_uses_profile_display_name(self):
        user = User.objects.create_user(
            email="private-address@example.com",
            password="Pass12345!",
        )
        ProfileModel.objects.create(
            user=user,
            name="Public name",
            display_name="PerfumeFriend",
        )

        self.assertEqual(public_user_username(user), "PerfumeFriend")
        self.assertEqual(public_user_display_name(user), "PerfumeFriend")

    def test_social_user_without_name_does_not_use_email_as_display_name(self):
        user, _ = get_or_create_user_from_google(
            provider_user_id="sub-private-name",
            email="private-address@example.com",
            email_verified=True,
            name=None,
        )

        self.assertEqual(user.profile.display_name, f"user{user.id}")
        self.assertNotIn("private", user.profile.display_name.lower())
        self.assertNotIn("example", user.profile.display_name.lower())

    def test_staff_marketplace_seller_is_personal_not_administration(self):
        staff = User.objects.create_user(
            email="staff-seller@example.com",
            password="Pass12345!",
            is_staff=True,
        )
        ProfileModel.objects.create(
            user=staff,
            name="Staff seller",
            display_name="staff-seller",
        )

        data = PublicUserSummarySerializer(staff).data

        self.assertEqual(data["username"], "staff-seller")
        self.assertEqual(data["display_name"], "staff-seller")
        self.assertNotEqual(data["username"], "admin")
        self.assertNotEqual(data["display_name"], "РђРґРјС–РЅС–СЃС‚СЂР°С†С–СЏ")
        self.assertEqual(public_user_username(staff), "staff-seller")
        self.assertEqual(public_user_display_name(staff), "staff-seller")

    def test_staff_public_content_serializers_use_personal_identity(self):
        staff = User.objects.create_user(
            email="staff-author@example.com",
            password="Pass12345!",
            is_staff=True,
        )
        ProfileModel.objects.create(
            user=staff,
            name="Staff author",
            display_name="StaffAuthor",
        )
        section = ForumSectionModel.objects.create(
            title="Public section",
            slug="public-section",
        )
        topic = ForumTopicModel.objects.create(
            section=section,
            author=staff,
            title="Public staff topic",
            slug="public-staff-topic",
            content="Topic body",
        )

        self.assertEqual(
            ActivityActorSerializer(staff).data["display_name"],
            "StaffAuthor",
        )
        self.assertEqual(
            ArticleAuthorSerializer(staff).data["display_name"],
            "StaffAuthor",
        )
        self.assertEqual(serialize_author(staff)["display_name"], "StaffAuthor")

        topic_data = ForumTopicSerializer(topic).data
        self.assertEqual(topic_data["author_username"], "StaffAuthor")
        self.assertEqual(topic_data["author_display_name"], "StaffAuthor")
        self.assertFalse(topic_data["author_is_staff"])
        self.assertIsNone(topic_data["author_role_label"])
