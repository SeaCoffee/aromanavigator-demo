from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken
from unittest.mock import patch

from apps.comments.models import CommentModel
from apps.exchange.models import ExchangeProposalModel
from apps.exchange.serializers import ExchangeUserSerializer
from apps.notifications.serializers import NotificationSerializer
from apps.photos.models import ObjectCoverModel
from apps.social.models import FollowModel
from apps.users.author_display import personal_user_display_name, personal_user_username
from apps.users.models import ProfileModel, UserStatsModel
from apps.users.serializers import PublicUserSummarySerializer


UserModel = get_user_model()


class DeleteSelfViewTests(APITestCase):
    def setUp(self):
        self.url = reverse("user_delete_self")
        self.user = UserModel.objects.create_user(
            email="test@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        self.profile = ProfileModel.objects.create(
            user=self.user,
            name="Test",
            display_name="test-user",
        )
        self.client = APIClient()

    def test_anonymous_cannot_delete_self(self):
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_pending_exchange_blocks_deletion(self):
        owner = UserModel.objects.create_user(
            email="owner@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        ExchangeProposalModel.objects.create(
            proposer=self.user,
            owner=owner,
            requested_ct=ContentType.objects.get_for_model(owner),
            requested_id=owner.id,
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("РѕР±РјС–РЅСѓ", str(response.data))

    def test_staff_account_cannot_be_deleted_from_user_settings(self):
        self.user.is_staff = True
        self.user.save(update_fields=["is_staff"])
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)
        self.assertIsNone(self.user.deleted_at)

    def test_delete_anonymizes_user_and_preserves_history(self):
        other = UserModel.objects.create_user(
            email="other@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        comment = CommentModel.objects.create(
            user=self.user,
            content_type=ContentType.objects.get_for_model(other),
            object_id=other.pk,
            body="Public history",
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.user.refresh_from_db()
        self.profile.refresh_from_db()
        self.assertFalse(self.user.is_active)
        self.assertIsNotNone(self.user.deleted_at)
        self.assertTrue(self.user.email.endswith("@invalid.local"))
        self.assertFalse(self.user.has_usable_password())
        self.assertEqual(self.profile.name, "Видалений користувач")
        self.assertTrue(self.profile.display_name.startswith("deleted-user-"))
        self.assertTrue(CommentModel.objects.filter(pk=comment.pk, user=self.user).exists())
        self.assertEqual(personal_user_display_name(self.user), "Р’РёРґР°Р»РµРЅРёР№ РєРѕСЂРёСЃС‚СѓРІР°С‡")
        self.assertIsNone(personal_user_username(self.user))
        self.assertIsNone(ExchangeUserSerializer(self.user).data["id"])
        self.assertIsNone(PublicUserSummarySerializer(self.user).data["username"])
        self.assertEqual(
            NotificationSerializer()._user_ref_extra(self.user, self.user.id)["display_name"],
            "Р’РёРґР°Р»РµРЅРёР№ РєРѕСЂРёСЃС‚СѓРІР°С‡",
        )

    def test_delete_removes_avatar(self):
        avatar = ObjectCoverModel.objects.create(
            content_type=ContentType.objects.get_for_model(ProfileModel),
            object_id=self.profile.pk,
            image="covers/private-avatar.jpg",
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ObjectCoverModel.objects.filter(pk=avatar.pk).exists())
        self.profile.refresh_from_db()
        self.assertEqual(self.profile.region, "other")

    def test_delete_removes_social_links_and_recounts_other_user(self):
        other = UserModel.objects.create_user(
            email="followed@example.com",
            password="StrongPass123!",
            is_active=True,
        )
        FollowModel.objects.create(follower=self.user, followee=other)
        UserStatsModel.objects.create(user=other, followers_count=1)
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(FollowModel.objects.filter(follower=self.user).exists())
        other.stats.refresh_from_db()
        self.assertEqual(other.stats.followers_count, 0)

    def test_refresh_tokens_are_blacklisted_on_delete(self):
        refresh = RefreshToken.for_user(self.user)
        _ = str(refresh)
        self.client.force_authenticate(user=self.user)
        before = BlacklistedToken.objects.count()

        response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(OutstandingToken.objects.filter(user=self.user).exists())
        self.assertGreater(BlacklistedToken.objects.count(), before)

    @patch("apps.users.user_account_service.EmailService.send_html")
    def test_delete_sends_localized_confirmation_to_original_email(self, send_html):
        self.client.force_authenticate(user=self.user)

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        send_html.assert_called_once_with(
            to="test@example.com",
            template_name="delete_account.html",
            context={"name": "Test"},
            subject="РђРєР°СѓРЅС‚ Aroma Navigator РІРёРґР°Р»РµРЅРѕ",
        )
