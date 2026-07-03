# apps/fragrance_ugc/tests/test_moderation_api.py

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework.test import APITestCase
from rest_framework import status

from apps.fragrance.models import BrandModel as Brand, FragranceModel, NoteModel as Note
from apps.fragrance_ugc.models import (
    UserFragranceNoteSuggestionModel as UserFragranceNoteSuggestion,
    FragranceSimilaritySuggestionModel as FragranceSimilaritySuggestion,
    FragranceAddRequestModel as FragranceAddRequest,
)

User = get_user_model()


class FragranceUGCModerationAPITest(APITestCase):
    def setUp(self):
        moderator_group, _ = Group.objects.get_or_create(name="moderator")

        self.user = User.objects.create_user(
            email="mod@test.com",
            password="123456",
        )
        self.user.groups.add(moderator_group)
        self.client.force_authenticate(self.user)

        self.brand = Brand.objects.create(name="Dior", slug="dior")
        self.fragrance1 = FragranceModel.objects.create(
            brand=self.brand,
            name="Poison",
            slug="poison",
            release_year=1985,
        )
        self.fragrance2 = FragranceModel.objects.create(
            brand=self.brand,
            name="Hypnotic Poison",
            slug="hypnotic-poison",
            release_year=1998,
        )
        self.note = Note.objects.create(name="Vanilla", slug="vanilla")

        self.note_suggestion = UserFragranceNoteSuggestion.objects.create(
            fragrance=self.fragrance1,
            note=self.note,
            created_by=self.user,
            status="pending",
        )

        self.similarity_suggestion = FragranceSimilaritySuggestion.objects.create(
            fragrance=self.fragrance1,
            similar_fragrance=self.fragrance2,
            created_by=self.user,
            status="pending",
        )

        self.add_request = FragranceAddRequest.objects.create(
            created_by=self.user,
            brand_name="YSL",
            fragrance_name="Opium",
            release_year=1977,
            status="pending",
        )

    def test_moderate_note_suggestion(self):
        url = f"/userApi/fragrance_ugc/mod/note-suggestions/{self.note_suggestion.id}/status"
        payload = {
            "status": "approved",
            "moderator_comment": "looks good",
        }

        resp = self.client.patch(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        self.note_suggestion.refresh_from_db()
        self.assertEqual(self.note_suggestion.status, "approved")
        self.assertEqual(self.note_suggestion.moderator_comment, "looks good")

    def test_moderate_similarity_suggestion(self):
        url = f"/userApi/fragrance_ugc/mod/similarity-suggestions/{self.similarity_suggestion.id}/status"
        payload = {
            "status": "rejected",
            "moderator_comment": "not similar enough",
        }

        resp = self.client.patch(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        self.similarity_suggestion.refresh_from_db()
        self.assertEqual(self.similarity_suggestion.status, "rejected")

    def test_rejection_requires_moderator_comment(self):
        response = self.client.patch(
            f"/userApi/fragrance_ugc/mod/note-suggestions/{self.note_suggestion.id}/status",
            {"status": "rejected", "moderator_comment": ""},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("moderator_comment", response.data)

    def test_moderate_add_request(self):
        url = f"/userApi/fragrance_ugc/mod/add-requests/{self.add_request.id}/status"
        payload = {
            "status": "rejected",
            "moderator_comment": "not enough sources",
        }

        resp = self.client.patch(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        self.add_request.refresh_from_db()
        self.assertEqual(self.add_request.status, "rejected")
