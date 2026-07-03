from __future__ import annotations

import io
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from PIL import Image
from rest_framework import status
from rest_framework.test import APIClient

from apps.articles.models import Article
from apps.photos.models import ObjectCoverModel, ObjectPhotoModel
from apps.users.models import UserModel
from core.choises.article_status_choise import ArticleStatus


def image_file(name: str) -> SimpleUploadedFile:
    buffer = io.BytesIO()
    Image.new("RGB", (24, 24), color="white").save(buffer, format="PNG")

    return SimpleUploadedFile(name, buffer.getvalue(), content_type="image/png")


class ArticlePhotoApiTests(TestCase):
    def setUp(self):
        self.media_dir = tempfile.TemporaryDirectory()
        self.settings_override = override_settings(MEDIA_ROOT=self.media_dir.name)
        self.settings_override.enable()

        self.client = APIClient()
        self.user = UserModel.objects.create_user(
            email="article-photo-author@example.com",
            password="pass12345",
            is_active=True,
        )
        self.article = Article.objects.create(
            author=self.user,
            title="Article with photos",
            content="Article body",
            status=ArticleStatus.PUBLISHED,
        )
        self.client.force_authenticate(self.user)

    def tearDown(self):
        self.settings_override.disable()
        self.media_dir.cleanup()

    def test_article_photos_use_shared_storage_and_are_returned_by_article_api(self):
        target = f"articles.article:{self.article.id}"

        cover_response = self.client.post(
            "/userApi/photos/object/cover",
            {"target": target, "image": image_file("cover.png")},
            format="multipart",
        )
        attachments_response = self.client.post(
            "/userApi/photos/object/attachments",
            {"target": target, "images": [image_file("inline.png")]},
            format="multipart",
        )

        self.assertEqual(
            cover_response.status_code,
            status.HTTP_201_CREATED,
            cover_response.data,
        )
        self.assertEqual(
            attachments_response.status_code,
            status.HTTP_201_CREATED,
            attachments_response.data,
        )

        detail_response = self.client.get(f"/userApi/articles/{self.article.id}")

        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertIn(
            "/userApi/media/photos/covers/articles/article/",
            detail_response.data["cover"]["image"],
        )
        self.assertIn(
            "/userApi/media/photos/attachments/articles/article/",
            detail_response.data["attachments"][0]["image"],
        )
        self.assertEqual(ObjectCoverModel.objects.count(), 1)
        self.assertEqual(ObjectPhotoModel.objects.count(), 1)

    def test_deleting_article_removes_shared_photo_rows(self):
        target = f"articles.article:{self.article.id}"
        self.client.post(
            "/userApi/photos/object/cover",
            {"target": target, "image": image_file("cover.png")},
            format="multipart",
        )
        self.client.post(
            "/userApi/photos/object/attachments",
            {"target": target, "images": [image_file("inline.png")]},
            format="multipart",
        )

        response = self.client.delete(f"/userApi/articles/me/{self.article.id}")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ObjectCoverModel.objects.exists())
        self.assertFalse(ObjectPhotoModel.objects.exists())

    def test_article_rejects_more_than_ten_attachments_per_upload(self):
        target = f"articles.article:{self.article.id}"

        response = self.client.post(
            "/userApi/photos/object/attachments",
            {
                "target": target,
                "images": [
                    image_file(f"inline-{index}.png")
                    for index in range(11)
                ],
            },
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(ObjectPhotoModel.objects.exists())
