from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import status
from rest_framework.test import APITestCase

from apps.fragrance.models import BrandModel, NoteModel


User = get_user_model()


class SlugCreationApiTest(APITestCase):
    def setUp(self):
        moderator_group, _ = Group.objects.get_or_create(name="moderator")
        user = User.objects.create_user(
            email="slug-moderator@example.com",
            password="testpass123",
        )
        user.groups.add(moderator_group)
        self.client.force_authenticate(user)

    def test_brand_slug_is_generated_by_create_endpoint(self):
        response = self.client.post(
            "/userApi/fragrance/brands/create",
            {"name": "Maison Francis Kurkdjian"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            BrandModel.objects.get(pk=response.data["id"]).slug,
            "maison-francis-kurkdjian",
        )

    def test_note_slug_is_generated_by_create_endpoint(self):
        response = self.client.post(
            "/userApi/fragrance/notes/create",
            {"name": "Pink Pepper"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            NoteModel.objects.get(pk=response.data["id"]).slug,
            "pink-pepper",
        )
