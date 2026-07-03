from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.contrib.contenttypes.models import ContentType

from rest_framework.test import APIClient
from rest_framework import status

from apps.forum.models import ForumSectionModel, ForumTopicModel
from apps.mentions.models import MentionModel
from apps.tags.models import TagModel, TaggedItemModel
from apps.users.models import ProfileModel

User = get_user_model()


class ForumMentionsTagsTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.author = User.objects.create_user(
            email="author@test.com",
            password="pass12345",
            is_active=True,
        )

        self.mentioned = User.objects.create_user(
            email="bob@test.com",
            password="pass12345",
            is_active=True,
        )

        # рџ‘‡ РІРѕС‚ СЌС‚Рѕ Рё РµСЃС‚СЊ "username" РґР»СЏ mentions
        ProfileModel.objects.create(
            user=self.mentioned,
            name="Bob",
            display_name="bob",
        )

        self.section = ForumSectionModel.objects.create(
            title="General",
            slug="general",
            description="",
            is_active=True,
            order=0,
        )

        self.client.force_authenticate(self.author)
    # =========================
    # TAGS
    # =========================
    def test_create_topic_with_tags(self):
        url = reverse("forum:forum-topic-list")

        payload = {
            "section": self.section.id,
            "title": "Topic with #rose #oud",
            "content": "content #rose",
            "tags": ["amber"],
        }

        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.data)

        topic_id = r.data["id"]

        ct = ContentType.objects.get_for_model(ForumTopicModel, for_concrete_model=False)

        tagged_codes = set(
            TaggedItemModel.objects
            .filter(content_type=ct, object_id=topic_id)
            .select_related("tag")
            .values_list("tag__code", flat=True)
        )

        self.assertEqual(tagged_codes, {"rose", "oud", "amber"})

    # =========================
    # MENTIONS IN TOPIC
    # =========================
    def test_create_topic_with_mention(self):
        url = reverse("forum:forum-topic-list")

        payload = {
            "section": self.section.id,
            "title": "Hello @bob",
            "content": "ping @bob",
        }

        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.data)

        topic_id = r.data["id"]

        ct = ContentType.objects.get_for_model(ForumTopicModel, for_concrete_model=False)

        self.assertTrue(
            MentionModel.objects.filter(
                content_type=ct,
                object_id=topic_id,
                user=self.mentioned
            ).exists()
        )

    # =========================
    # MENTIONS IN COMMENT
    # =========================
    def test_create_comment_with_mention(self):
        topic = ForumTopicModel.objects.create(
            section=self.section,
            author=self.author,
            title="Topic",
            slug="topic",
            content="content",
        )

        url = reverse("comments:comment-list-create")

        payload = {
            "target": {
                "app": "forum",
                "model": "forumtopicmodel",
                "id": topic.id,
            },
            "body": "reply @bob",
        }

        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.data)

        comment_id = r.data["id"]

        from apps.comments.models import CommentModel
        ct = ContentType.objects.get_for_model(CommentModel, for_concrete_model=False)

        self.assertTrue(
            MentionModel.objects.filter(
                content_type=ct,
                object_id=comment_id,
                user=self.mentioned
            ).exists()
        )
