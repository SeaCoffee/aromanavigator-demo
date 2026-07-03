from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.social.models import BlockModel, FollowModel
from apps.social.models import SubscriptionModel
from apps.forum.models import ForumSectionModel, ForumTopicModel
from apps.users.models import ProfileModel, UserStatsModel


User = get_user_model()


class SocialApiContractTests(APITestCase):
    def setUp(self):
        self.actor = self._create_user("actor@example.com", "Actor")
        self.target = self._create_user("target@example.com", "Target")
        self.client.force_authenticate(self.actor)

    @staticmethod
    def _create_user(email: str, display_name: str, *, is_active: bool = True):
        user = User.objects.create_user(
            email=email,
            password="Pass12345!",
            is_active=is_active,
        )
        ProfileModel.objects.create(
            user=user,
            name=display_name,
            display_name=display_name,
        )
        UserStatsModel.objects.create(user=user)
        return user

    def test_follow_toggle_updates_relation_and_counts(self):
        url = reverse("social:social-follow-toggle", kwargs={"user_id": self.target.id})

        followed = self.client.post(url)
        unfollowed = self.client.post(url)

        self.assertEqual(followed.status_code, status.HTTP_200_OK)
        self.assertEqual(followed.data["status"], "followed")
        self.assertEqual(followed.data["me"]["following_count"], 1)
        self.assertEqual(followed.data["target"]["followers_count"], 1)
        self.assertEqual(unfollowed.data["status"], "unfollowed")
        self.assertFalse(
            FollowModel.objects.filter(follower=self.actor, followee=self.target).exists()
        )

    def test_block_removes_follows_in_both_directions_and_unblocks(self):
        FollowModel.objects.create(follower=self.actor, followee=self.target)
        FollowModel.objects.create(follower=self.target, followee=self.actor)
        url = reverse("social:social-block-toggle", kwargs={"user_id": self.target.id})

        blocked = self.client.post(url)
        unblocked = self.client.post(url)

        self.assertEqual(blocked.data["status"], "blocked")
        self.assertFalse(
            FollowModel.objects.filter(
                follower_id__in=[self.actor.id, self.target.id],
                followee_id__in=[self.actor.id, self.target.id],
            ).exists()
        )
        self.assertEqual(unblocked.data["status"], "unblocked")
        self.assertFalse(
            BlockModel.objects.filter(blocker=self.actor, blocked=self.target).exists()
        )

    def test_follow_is_rejected_when_blocked_between(self):
        BlockModel.objects.create(blocker=self.target, blocked=self.actor)

        response = self.client.post(
            reverse("social:social-follow-toggle", kwargs={"user_id": self.target.id})
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Р±Р»РѕРєСѓРІР°РЅРЅСЏ", response.data["detail"])

    def test_actions_reject_inactive_target(self):
        inactive = self._create_user(
            "inactive@example.com",
            "Inactive",
            is_active=False,
        )

        follow_response = self.client.post(
            reverse("social:social-follow-toggle", kwargs={"user_id": inactive.id})
        )
        block_response = self.client.post(
            reverse("social:social-block-toggle", kwargs={"user_id": inactive.id})
        )

        self.assertEqual(follow_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(block_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_social_state_reports_directional_block(self):
        BlockModel.objects.create(blocker=self.actor, blocked=self.target)

        response = self.client.get(
            reverse("social:social-state", kwargs={"user_id": self.target.id})
        )

        self.assertEqual(
            response.data,
            {
                "is_following": False,
                "is_blocked_by_me": True,
                "is_blocked_between": True,
            },
        )

    def test_followers_list_is_paginated_and_hides_blocked_users(self):
        hidden = None

        for index in range(22):
            follower = self._create_user(
                f"follower-{index}@example.com",
                f"Follower{index:02d}",
            )
            FollowModel.objects.create(follower=follower, followee=self.target)

            if index == 0:
                hidden = follower

        self.assertIsNotNone(hidden)
        BlockModel.objects.create(blocker=hidden, blocked=self.actor)

        response = self.client.get(
            reverse("social:social-followers", kwargs={"user_id": self.target.id})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_items"], 21)
        self.assertEqual(len(response.data["results"]), 20)
        self.assertNotIn(hidden.id, {item["id"] for item in response.data["results"]})

    def test_subscribe_rejects_hidden_topic_and_blocked_author(self):
        section = ForumSectionModel.objects.create(title="Section", slug="section")
        hidden = ForumTopicModel.objects.create(
            section=section,
            author=self.target,
            title="Hidden",
            slug="hidden",
            content="Hidden",
            is_hidden=True,
        )

        hidden_response = self.client.post(
            reverse("social:social-subscribe"),
            {"target": f"forum.forumtopicmodel:{hidden.id}"},
            format="json",
        )

        hidden.is_hidden = False
        hidden.save(update_fields=["is_hidden"])
        BlockModel.objects.create(blocker=self.target, blocked=self.actor)
        blocked_response = self.client.post(
            reverse("social:social-subscribe"),
            {"target": f"forum.forumtopicmodel:{hidden.id}"},
            format="json",
        )

        self.assertEqual(hidden_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(blocked_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_deleted_target_subscription_can_be_removed_by_subscription_id(self):
        section = ForumSectionModel.objects.create(title="Delete Section", slug="delete-section")
        topic = ForumTopicModel.objects.create(
            section=section,
            author=self.target,
            title="Delete Topic",
            slug="delete-topic",
            content="Delete",
        )
        subscription = SubscriptionModel.objects.create(
            user=self.actor,
            content_type=ContentType.objects.get_for_model(topic),
            object_id=topic.id,
        )
        topic.delete()

        response = self.client.delete(
            reverse(
                "social:social-subscription-delete",
                kwargs={"pk": subscription.id},
            )
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(SubscriptionModel.objects.filter(id=subscription.id).exists())
