from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

from rest_framework.test import APIClient
from rest_framework import status

from apps.forum.models import ForumSectionModel, ForumTopicModel

User = get_user_model()


class ForumTopicApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            email="alice@test.com",
            password="pass12345",
            is_active=True,
        )

        self.staff = User.objects.create_user(
            email="admin@test.com",
            password="pass12345",
            is_active=True,
            is_staff=True,
        )

        self.section = ForumSectionModel.objects.create(
            title="General",
            slug="general",
            description="",
            is_active=True,
            order=0,
        )

    def test_create_topic_increments_section_topics_count(self):
        self.client.force_authenticate(self.user)

        url = reverse("forum:forum-topic-list")
        payload = {
            "section": self.section.id,
            "title": "Hello",
            "content": "World",
            "tags": ["rose"],  # РјРѕР¶РЅРѕ Рё Р±РµР·, РЅРѕ РїСѓСЃС‚СЊ РїСЂРѕРІРµСЂРёС‚СЃСЏ РїР°Р№РїР»Р°Р№РЅ
        }

        r = self.client.post(url, payload, format="json")
        self.assertEqual(r.status_code, status.HTTP_201_CREATED, r.data)

        self.section.refresh_from_db()
        self.assertEqual(self.section.topics_count, 1)

        topic_id = r.data["id"]
        topic = ForumTopicModel.objects.get(id=topic_id)
        self.assertEqual(topic.author_id, self.user.id)
        self.assertEqual(topic.section_id, self.section.id)
        self.assertFalse(topic.is_hidden)

    def test_retrieve_topic_increments_views(self):
        topic = ForumTopicModel.objects.create(
            section=self.section,
            author=self.user,
            title="T",
            slug="t",
            content="C",
        )

        url = reverse("forum:forum-topic-detail", kwargs={"pk": topic.id})

        r1 = self.client.get(url)
        self.assertEqual(r1.status_code, 200)
        topic.refresh_from_db()
        self.assertEqual(topic.views_count, 1)

        r2 = self.client.get(url)
        self.assertEqual(r2.status_code, 200)
        topic.refresh_from_db()
        self.assertEqual(topic.views_count, 2)

    def test_soft_delete_topic_decrements_section_topics_count_if_not_hidden(self):
        self.client.force_authenticate(self.user)

        # СЃРѕР·РґР°С‚СЊ С‡РµСЂРµР· РјРѕРґРµР»СЊ вЂ” С‚РѕРіРґР° topics_count РІСЂСѓС‡РЅСѓСЋ РїРѕРґРЅРёРјРµРј, РєР°Рє Р±СѓРґС‚Рѕ СЃРѕР·РґР°Р»Рё С‡РµСЂРµР· API
        topic = ForumTopicModel.objects.create(
            section=self.section,
            author=self.user,
            title="T",
            slug="t",
            content="C",
            is_hidden=False,
        )
        ForumSectionModel.objects.filter(id=self.section.id).update(topics_count=1)

        url = reverse("forum:forum-topic-detail", kwargs={"pk": topic.id})
        r = self.client.delete(url)
        self.assertIn(r.status_code, (status.HTTP_204_NO_CONTENT, status.HTTP_200_OK), r.content)

        self.section.refresh_from_db()
        self.assertEqual(self.section.topics_count, 0)

        topic.refresh_from_db()
        self.assertTrue(topic.is_hidden)
