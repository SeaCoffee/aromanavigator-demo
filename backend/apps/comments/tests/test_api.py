from __future__ import annotations

import io
import tempfile

from django.contrib.contenttypes.models import ContentType
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient

from apps.comments.models import CommentModel
from apps.articles.models import Article
from apps.forum.models import ForumSectionModel, ForumTopicModel
from apps.fragrance.models import BrandModel, FragranceModel
from apps.photos.models import ObjectPhotoModel
from apps.users.models import UserModel


def image_file(name: str = "comment.png") -> SimpleUploadedFile:
    buffer = io.BytesIO()
    Image.new("RGB", (16, 16), color="white").save(buffer, format="PNG")

    return SimpleUploadedFile(
        name,
        buffer.getvalue(),
        content_type="image/png",
    )


class CommentApiTests(TestCase):
    def setUp(self):
        self.media_dir = tempfile.TemporaryDirectory()
        self.settings_override = override_settings(MEDIA_ROOT=self.media_dir.name)
        self.settings_override.enable()

        self.client = APIClient()
        self.user = UserModel.objects.create_user(
            email="comment-author@example.com",
            password="pass12345",
            is_active=True,
        )
        self.other_user = UserModel.objects.create_user(
            email="other-comment-author@example.com",
            password="pass12345",
            is_active=True,
        )
        self.section = ForumSectionModel.objects.create(
            title="Comments",
            slug="comments",
            description="",
            is_active=True,
            order=0,
        )
        self.topic = ForumTopicModel.objects.create(
            section=self.section,
            author=self.user,
            title="Comment target",
            slug="comment-target",
            content="Topic body",
        )
        self.other_topic = ForumTopicModel.objects.create(
            section=self.section,
            author=self.other_user,
            title="Other target",
            slug="other-comment-target",
            content="Other topic body",
        )
        self.topic_content_type = ContentType.objects.get_for_model(
            ForumTopicModel,
            for_concrete_model=False,
        )
        self.collection_url = reverse("comments:comment-list-create")

    def tearDown(self):
        self.settings_override.disable()
        self.media_dir.cleanup()

    def target(self, topic=None):
        return {
            "app": "forum",
            "model": "forumtopicmodel",
            "id": (topic or self.topic).id,
        }

    def create_comment(self, *, body="РљРѕРјРµРЅС‚Р°СЂ", parent_id=None):
        payload = {
            "target": self.target(),
            "body": body,
        }

        if parent_id is not None:
            payload["parent_id"] = parent_id

        return self.client.post(self.collection_url, payload, format="json")

    def test_create_requires_authentication(self):
        response = self.create_comment()

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_published_article_accepts_comments_and_draft_does_not(self):
        published = Article.objects.create(
            author=self.user,
            title="Published article",
            content="Published body",
            status="published",
        )
        draft = Article.objects.create(
            author=self.user,
            title="Draft article",
            content="Draft body",
            status="draft",
        )
        self.client.force_authenticate(self.other_user)

        published_response = self.client.post(
            self.collection_url,
            {
                "target": {
                    "app": "articles",
                    "model": "article",
                    "id": published.id,
                },
                "body": "РљРѕРјРµРЅС‚Р°СЂ РґРѕ СЃС‚Р°С‚С‚С–",
            },
            format="json",
        )
        draft_response = self.client.post(
            self.collection_url,
            {
                "target": {
                    "app": "articles",
                    "model": "article",
                    "id": draft.id,
                },
                "body": "РљРѕРјРµРЅС‚Р°СЂ РґРѕ С‡РµСЂРЅРµС‚РєРё",
            },
            format="json",
        )

        self.assertEqual(published_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            published_response.data["target"]["title"],
            "Published article",
        )
        self.assertEqual(draft_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            CommentModel.objects.filter(
                object_id=draft.id,
                content_type__app_label="articles",
            ).exists()
        )

    def test_create_returns_comment_and_updates_forum_counters(self):
        self.client.force_authenticate(self.user)

        response = self.create_comment()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data["body"], "РљРѕРјРµРЅС‚Р°СЂ")
        self.assertTrue(response.data["is_owner"])
        self.assertEqual(response.data["attachments"], [])

        self.topic.refresh_from_db()
        self.section.refresh_from_db()
        self.assertEqual(self.topic.comments_count, 1)
        self.assertEqual(self.section.comments_count, 1)

    def test_staff_comment_is_official_only_when_selected(self):
        self.user.is_staff = True
        self.user.save(update_fields=["is_staff"])
        self.client.force_authenticate(self.user)

        personal = self.create_comment(body="РћСЃРѕР±РёСЃС‚РёР№ РєРѕРјРµРЅС‚Р°СЂ")
        official = self.client.post(
            self.collection_url,
            {
                "target": self.target(),
                "body": "РћС„С–С†С–Р№РЅРёР№ РєРѕРјРµРЅС‚Р°СЂ",
                "is_official": True,
            },
            format="json",
        )

        self.assertFalse(personal.data["user_is_staff"])
        self.assertEqual(personal.data["user_display_name"], "РљРѕСЂРёСЃС‚СѓРІР°С‡")
        self.assertTrue(official.data["user_is_staff"])
        self.assertEqual(official.data["user_display_name"], "РђРґРјС–РЅС–СЃС‚СЂР°С†С–СЏ")

    def test_regular_user_cannot_publish_official_comment(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.collection_url,
            {
                "target": self.target(),
                "body": "РќРµРѕС„С–С†С–Р№РЅРёР№ РєРѕРјРµРЅС‚Р°СЂ",
                "is_official": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("is_official", response.data)

    def test_create_with_photo_uses_shared_photo_storage(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.collection_url,
            {
                "target": f"forum.forumtopicmodel:{self.topic.id}",
                "body": "РљРѕРјРµРЅС‚Р°СЂ С–Р· С„РѕС‚Рѕ",
                "images": [image_file()],
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(len(response.data["attachments"]), 1)
        self.assertIn(
            "/userApi/media/photos/attachments/comments/commentmodel/",
            response.data["attachments"][0]["image"],
        )

        photo = ObjectPhotoModel.objects.get()
        self.assertTrue(photo.image.storage.exists(photo.image.name))

        delete_response = self.client.delete(
            reverse("comments:comment-detail", kwargs={"pk": response.data["id"]}),
        )

        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ObjectPhotoModel.objects.exists())

    def test_reply_must_belong_to_same_target(self):
        parent = CommentModel.objects.create(
            user=self.user,
            content_type=self.topic_content_type,
            object_id=self.other_topic.id,
            body="Other topic comment",
        )
        self.client.force_authenticate(self.user)

        response = self.create_comment(parent_id=parent.id)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("parent_id", response.data)

    def test_fragrance_comment_is_available_in_thread(self):
        brand = BrandModel.objects.create(
            name="Comment Brand",
            slug="comment-brand",
        )
        fragrance = FragranceModel.objects.create(
            brand=brand,
            name="Comment Fragrance",
            slug="comment-fragrance",
        )
        self.client.force_authenticate(self.user)

        create_response = self.client.post(
            self.collection_url,
            {
                "target": {
                    "app": "fragrance",
                    "model": "fragrancemodel",
                    "id": fragrance.id,
                },
                "body": "Р’С–РґРіСѓРє РїСЂРѕ Р°СЂРѕРјР°С‚",
            },
            format="json",
        )
        self.assertEqual(
            create_response.status_code,
            status.HTTP_201_CREATED,
            create_response.data,
        )

        self.client.force_authenticate(user=None)
        thread_response = self.client.get(
            reverse("comments:comment-thread"),
            {
                "app": "fragrance",
                "model": "fragrancemodel",
                "id": fragrance.id,
            },
        )

        self.assertEqual(thread_response.status_code, status.HTTP_200_OK)
        self.assertEqual(thread_response.data["total_items"], 1)
        self.assertEqual(
            thread_response.data["results"][0]["body"],
            "Р’С–РґРіСѓРє РїСЂРѕ Р°СЂРѕРјР°С‚",
        )
        self.assertEqual(thread_response.data["results"][0]["attachments"], [])
        self.assertEqual(
            thread_response.data["results"][0]["target"],
            {
                "app": "fragrance",
                "model": "fragrancemodel",
                "id": fragrance.id,
                "title": str(fragrance),
                "slug": fragrance.slug,
            },
        )

    def test_owner_can_update_and_soft_delete_comment(self):
        comment = CommentModel.objects.create(
            user=self.user,
            content_type=self.topic_content_type,
            object_id=self.topic.id,
            body="Before",
        )
        detail_url = reverse("comments:comment-detail", kwargs={"pk": comment.id})
        self.client.force_authenticate(self.user)

        update_response = self.client.patch(
            detail_url,
            {"body": "After"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["body"], "After")

        delete_response = self.client.delete(detail_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        comment.refresh_from_db()
        self.assertTrue(comment.is_deleted)
        self.assertEqual(comment.body, "")

    def test_non_owner_cannot_update_comment(self):
        comment = CommentModel.objects.create(
            user=self.user,
            content_type=self.topic_content_type,
            object_id=self.topic.id,
            body="Owner body",
        )
        detail_url = reverse("comments:comment-detail", kwargs={"pk": comment.id})
        self.client.force_authenticate(self.other_user)

        response = self.client.patch(
            detail_url,
            {"body": "Not allowed"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
