from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.contrib.contenttypes.models import ContentType

from rest_framework.test import APIClient
from rest_framework import status

from apps.forum.models import ForumSectionModel, ForumTopicModel
from apps.comments.models import CommentModel
from apps.comments.constants import MAX_COMMENT_TREE_DEPTH

User = get_user_model()


class ForumCommentApiTests(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            email="alice@test.com",
            password="pass12345",
            is_active=True,
        )

        self.section = ForumSectionModel.objects.create(
            title="General",
            slug="general",
            description="",
            is_active=True,
            order=0,
        )

        self.topic = ForumTopicModel.objects.create(
            section=self.section,
            author=self.user,
            title="Topic",
            slug="topic",
            content="content",
        )

        self.ct_topic = ContentType.objects.get_for_model(ForumTopicModel, for_concrete_model=False)

        self.client.force_authenticate(self.user)

    def _target(self):
        return {
            "app": "forum",
            "model": "forumtopicmodel",  # вљ пёЏ РІР°Р¶РЅРѕ
            "id": self.topic.id,
        }

    # =========================
    def test_create_comment_increments_counters(self):
        url = reverse("comments:comment-list-create")

        payload = {
            "target": self._target(),
            "body": "Hello world",
        }

        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.data)

        self.topic.refresh_from_db()
        self.section.refresh_from_db()

        self.assertEqual(self.topic.comments_count, 1)
        self.assertEqual(self.section.comments_count, 1)

    # =========================
    def test_reply_comment(self):
        parent = CommentModel.objects.create(
            user=self.user,
            content_type=self.ct_topic,
            object_id=self.topic.id,
            body="parent",
        )

        url = reverse("comments:comment-list-create")

        payload = {
            "target": self._target(),
            "body": "reply",
            "parent_id": parent.id,
        }

        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.data)

        self.assertEqual(CommentModel.objects.count(), 2)

    # =========================
    def test_reply_depth_limit(self):
        c1 = CommentModel.objects.create(user=self.user, content_type=self.ct_topic, object_id=self.topic.id, body="1")
        parent = c1
        for index in range(2, MAX_COMMENT_TREE_DEPTH + 1):
            parent = CommentModel.objects.create(
                user=self.user,
                content_type=self.ct_topic,
                object_id=self.topic.id,
                body=str(index),
                parent=parent,
            )

        url = reverse("comments:comment-list-create")

        payload = {
            "target": self._target(),
            "body": "too deep",
            "parent_id": parent.id,
        }

        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    # =========================
    def test_delete_comment_decrements_counters(self):
        create_url = reverse("comments:comment-list-create")

        payload = {
            "target": self._target(),
            "body": "hello",
        }

        r = self.client.post(create_url, payload, format="json")
        self.assertEqual(r.status_code, 201)

        comment_id = r.data["id"]

        self.topic.refresh_from_db()
        self.section.refresh_from_db()
        self.assertEqual(self.topic.comments_count, 1)
        self.assertEqual(self.section.comments_count, 1)

        delete_url = reverse("comments:comment-detail", kwargs={"pk": comment_id})
        r2 = self.client.delete(delete_url)

        self.assertEqual(r2.status_code, status.HTTP_204_NO_CONTENT)

        self.topic.refresh_from_db()
        self.section.refresh_from_db()

        self.assertEqual(self.topic.comments_count, 0)
        self.assertEqual(self.section.comments_count, 0)
