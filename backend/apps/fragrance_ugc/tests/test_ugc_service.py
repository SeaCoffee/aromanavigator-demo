# apps/fragrance_ugc/tests/test_ugc_service.py

from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.fragrance.models import BrandModel as Brand, FragranceModel, NoteModel as Note
from apps.fragrance_ugc.models import (
    UserFragranceNoteSuggestionModel as UserFragranceNoteSuggestion,
    FragranceSimilaritySuggestionModel as FragranceSimilaritySuggestion,
    FragranceAddRequestModel as FragranceAddRequest,
)
from apps.fragrance_ugc.fragrance_ugc_service import FragranceUGCService
from apps.fragrance_ugc.mod_service import FragranceUGCModService

User = get_user_model()


class FragranceUGCServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@test.com",
            password="123456",
        )

        self.brand = Brand.objects.create(name="Chanel", slug="chanel")

        self.fragrance1 = FragranceModel.objects.create(
            brand=self.brand,
            name="Allure",
            slug="allure-service",
            release_year=1996,
        )
        self.fragrance2 = FragranceModel.objects.create(
            brand=self.brand,
            name="Chance",
            slug="chance-service",
            release_year=2003,
        )

        self.note = Note.objects.create(name="Rose", slug="rose")

    def test_create_note_suggestion(self):
        suggestion = FragranceUGCService.create_note_suggestion(
            user=self.user,
            fragrance_id=self.fragrance1.id,
            note_id=self.note.id,
        )

        self.assertEqual(suggestion.fragrance, self.fragrance1)
        self.assertEqual(suggestion.note, self.note)

    def test_create_similarity_suggestion(self):
        suggestion = FragranceUGCService.create_similarity_suggestion(
            user=self.user,
            fragrance_id=self.fragrance1.id,
            similar_fragrance_id=self.fragrance2.id,
        )

        self.assertEqual(suggestion.fragrance, self.fragrance1)
        self.assertEqual(suggestion.similar_fragrance, self.fragrance2)

    def test_create_add_request(self):
        req = FragranceUGCService.create_add_request(
            user=self.user,
            payload={
                "brand_name": "Guerlain",
                "fragrance_name": "Shalimar",
                "release_year": 1925,
                "perfumers_text": "Jacques Guerlain",
                "notes_text": "vanilla, iris",
                "families_text": "oriental",
                "links_text": "",
            },
        )

        self.assertEqual(req.brand_name, "Guerlain")
        self.assertEqual(req.fragrance_name, "Shalimar")

    def test_mod_service_changes_status(self):
        suggestion = UserFragranceNoteSuggestion.objects.create(
            fragrance=self.fragrance1,
            note=self.note,
            created_by=self.user,
            status="pending",
        )

        updated = FragranceUGCModService.set_note_suggestion_status(
            suggestion_id=suggestion.id,
            status="approved",
            moderator_comment="ok",
        )

        self.assertEqual(updated.status, "approved")
        self.assertEqual(updated.moderator_comment, "ok")
