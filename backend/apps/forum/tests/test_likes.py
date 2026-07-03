from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APIClient
from rest_framework import status

from apps.forum.models import ForumSectionModel, ForumTopicModel
from apps.likes.models import LikeModel

User = get_user_model()


class ForumLikeApiTests(TestCase):

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

        self.client.force_authenticate(self.user)

    def _target(self):
        return {
            "app": "forum",
            "model": "forumtopicmodel",
            "id": self.topic.id,
        }

    # =========================
    # CREATE LIKE
    # =========================
    def test_like_topic_increments_counter(self):
        url = reverse("likes:like-create")

        payload = {
            "target": self._target(),
        }

        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.data)

        self.topic.refresh_from_db()
        self.assertEqual(self.topic.likes_count, 1)
        self.assertEqual(LikeModel.objects.count(), 1)

    # =========================
    # DUPLICATE LIKE
    # =========================
    def test_duplicate_like_is_idempotent(self):
        url = reverse("likes:like-create")

        payload = {"target": self._target()}

        r1 = self.client.post(url, payload, format="json")
        self.assertEqual(r1.status_code, 201)

        r2 = self.client.post(url, payload, format="json")
        self.assertEqual(r2.status_code, 200)

        self.topic.refresh_from_db()
        self.assertEqual(self.topic.likes_count, 1)
        self.assertEqual(LikeModel.objects.count(), 1)

    # =========================
    # DELETE LIKE
    # =========================
    def test_delete_like_decrements_counter(self):
        create_url = reverse("likes:like-create")
        payload = {"target": self._target()}

        r = self.client.post(create_url, payload, format="json")
        self.assertEqual(r.status_code, 201)

        like_id = r.data["id"]

        delete_url = reverse("likes:like-delete", kwargs={"pk": like_id})
        r2 = self.client.delete(delete_url)

        self.assertEqual(r2.status_code, status.HTTP_204_NO_CONTENT)

        self.topic.refresh_from_db()
        self.assertEqual(self.topic.likes_count, 0)
        self.assertEqual(LikeModel.objects.count(), 0)
