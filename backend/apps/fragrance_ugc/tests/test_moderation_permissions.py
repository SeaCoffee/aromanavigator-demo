# apps/fragrance_ugc/tests/test_moderation_permissions.py

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework.test import APITestCase
from rest_framework import status

from apps.fragrance.models import BrandModel as Brand, FragranceModel, NoteModel as Note
from apps.fragrance_ugc.models import UserFragranceNoteSuggestionModel as UserFragranceNoteSuggestion

User = get_user_model()


class ModerationPermissionsAPITest(APITestCase):
    def setUp(self):
        self.brand = Brand.objects.create(name="Dior", slug="dior")
        self.fragrance = FragranceModel.objects.create(
            brand=self.brand,
            name="Poison",
            slug="poison-permissions",
            release_year=1985,
        )
        self.note = Note.objects.create(name="Vanilla", slug="vanilla")

        self.user = User.objects.create_user(
            email="user@test.com",
            password="123456",
        )
        self.moderator = User.objects.create_user(
            email="mod@test.com",
            password="123456",
        )

        moderator_group, _ = Group.objects.get_or_create(name="moderator")
        self.moderator.groups.add(moderator_group)

        self.suggestion = UserFragranceNoteSuggestion.objects.create(
            fragrance=self.fragrance,
            note=self.note,
            created_by=self.user,
            status="pending",
        )

    def test_anonymous_cannot_moderate(self):
        url = f"/userApi/fragrance_ugc/mod/note-suggestions/{self.suggestion.id}/status"
        payload = {"status": "approved"}

        resp = self.client.patch(url, payload, format="json")

        self.assertIn(resp.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_regular_user_cannot_moderate(self):
        self.client.force_authenticate(self.user)

        url = f"/userApi/fragrance_ugc/mod/note-suggestions/{self.suggestion.id}/status"
        payload = {"status": "approved"}

        resp = self.client.patch(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_moderator_can_moderate(self):
        self.client.force_authenticate(self.moderator)

        url = f"/userApi/fragrance_ugc/mod/note-suggestions/{self.suggestion.id}/status"
        payload = {
            "status": "approved",
            "moderator_comment": "ok",
        }

        resp = self.client.patch(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        self.suggestion.refresh_from_db()
        self.assertEqual(self.suggestion.status, "approved")
