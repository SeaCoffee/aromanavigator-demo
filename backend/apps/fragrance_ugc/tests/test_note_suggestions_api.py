# apps/fragrance_ugc/tests/test_note_suggestions_api.py

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from apps.fragrance.models import BrandModel, FragranceModel, NoteModel
from apps.fragrance_ugc.models import (
    UserFragranceNoteSuggestionModel,
    UserFragranceNoteVoteModel,
)

User = get_user_model()


class NoteSuggestionAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user1@test.com",
            password="123456",
        )
        self.client.force_authenticate(self.user)

        self.brand = BrandModel.objects.create(name="Dior", slug="dior")
        self.fragrance = FragranceModel.objects.create(
            brand=self.brand,
            name="Poison",
            slug="dior-poison",
            release_year=1985,
        )
        self.note = NoteModel.objects.create(name="Vanilla", slug="vanilla")

    def test_create_note_suggestion(self):
        url = f"/userApi/fragrance_ugc/fragrances/{self.fragrance.id}/note-suggestions/create"
        payload = {
            "note_id": self.note.id,
        }

        resp = self.client.post(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            UserFragranceNoteSuggestionModel.objects.filter(
                fragrance=self.fragrance,
                note=self.note,
                created_by=self.user,
            ).exists()
        )

    def test_list_note_suggestions_by_fragrance(self):
        pending = UserFragranceNoteSuggestionModel.objects.create(
            fragrance=self.fragrance,
            note=self.note,
            created_by=self.user,
            status="pending",
        )
        approved_note = NoteModel.objects.create(name="Amber", slug="amber")
        approved = UserFragranceNoteSuggestionModel.objects.create(
            fragrance=self.fragrance,
            note=approved_note,
            created_by=self.user,
            status="approved",
        )

        url = f"/userApi/fragrance_ugc/fragrances/{self.fragrance.id}/note-suggestions"

        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ids = {item["id"] for item in resp.data["results"]}
        self.assertIn(approved.id, ids)
        self.assertNotIn(pending.id, ids)

    def test_vote_note_suggestion(self):
        suggestion = UserFragranceNoteSuggestionModel.objects.create(
            fragrance=self.fragrance,
            note=self.note,
            created_by=self.user,
            status="pending",
        )

        voter = User.objects.create_user(
            email="voter@test.com",
            password="123456",
        )
        self.client.force_authenticate(voter)

        url = f"/userApi/fragrance_ugc/note-suggestions/{suggestion.id}/vote"
        payload = {
            "value": 1,
        }

        resp = self.client.post(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            UserFragranceNoteVoteModel.objects.filter(
                suggestion=suggestion,
                user=voter,
                value=1,
            ).exists()
        )
