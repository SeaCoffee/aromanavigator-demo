# apps/fragrance_ugc/tests/test_duplicate_suggestions.py

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from apps.fragrance.models import BrandModel as Brand, FragranceModel, NoteModel as Note
from apps.fragrance_ugc.models import (
    UserFragranceNoteSuggestionModel as UserFragranceNoteSuggestion,
    FragranceSimilaritySuggestionModel as FragranceSimilaritySuggestion,
)

User = get_user_model()


class DuplicateSuggestionsAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="dup@test.com",
            password="123456",
        )
        self.client.force_authenticate(self.user)

        self.brand = Brand.objects.create(name="Mugler", slug="mugler")
        self.fragrance1 = FragranceModel.objects.create(
            brand=self.brand,
            name="Angel",
            slug="angel",
            release_year=1992,
        )
        self.fragrance2 = FragranceModel.objects.create(
            brand=self.brand,
            name="Alien",
            slug="alien",
            release_year=2005,
        )
        self.note = Note.objects.create(name="Patchouli", slug="patchouli")

    def test_duplicate_note_suggestion_rejected(self):
        UserFragranceNoteSuggestion.objects.create(
            fragrance=self.fragrance1,
            note=self.note,
            created_by=self.user,
            status="pending",
        )

        url = f"/userApi/fragrance_ugc/fragrances/{self.fragrance1.id}/note-suggestions/create"
        payload = {
            "note_id": self.note.id,
        }

        resp = self.client.post(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_similarity_suggestion_rejected(self):
        FragranceSimilaritySuggestion.objects.create(
            fragrance=self.fragrance1,
            similar_fragrance=self.fragrance2,
            created_by=self.user,
            status="pending",
        )

        url = f"/userApi/fragrance_ugc/fragrances/{self.fragrance1.id}/similarity-suggestions/create"
        payload = {
            "similar_fragrance_id": self.fragrance2.id,
        }

        resp = self.client.post(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
