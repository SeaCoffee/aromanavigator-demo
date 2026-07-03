# apps/fragrance_ugc/tests/test_duplicate_votes.py

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.exceptions import ValidationError

from apps.fragrance.models import BrandModel as Brand, FragranceModel, NoteModel as Note
from apps.fragrance_ugc.models import (
    UserFragranceNoteSuggestionModel as UserFragranceNoteSuggestion,
    FragranceSimilaritySuggestionModel as FragranceSimilaritySuggestion,
)
from apps.fragrance_ugc.fragrance_ugc_service import FragranceUGCService

User = get_user_model()


class DuplicateVotesServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="vote@test.com",
            password="123456",
        )
        self.other_user = User.objects.create_user(
            email="other@test.com",
            password="123456",
        )

        self.brand = Brand.objects.create(name="Chanel", slug="chanel")
        self.fragrance1 = FragranceModel.objects.create(
            brand=self.brand,
            name="Allure",
            slug="allure-votes",
            release_year=1996,
        )
        self.fragrance2 = FragranceModel.objects.create(
            brand=self.brand,
            name="Chance",
            slug="chance-votes",
            release_year=2003,
        )
        self.note = Note.objects.create(name="Rose", slug="rose")

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

    def test_same_note_vote_twice_rejected(self):
        FragranceUGCService.vote_note_suggestion(
            user=self.other_user,
            suggestion_id=self.note_suggestion.id,
            value=1,
        )

        with self.assertRaises(ValidationError):
            FragranceUGCService.vote_note_suggestion(
                user=self.other_user,
                suggestion_id=self.note_suggestion.id,
                value=1,
            )

    def test_note_vote_can_be_changed(self):
        vote = FragranceUGCService.vote_note_suggestion(
            user=self.other_user,
            suggestion_id=self.note_suggestion.id,
            value=1,
        )

        updated_vote = FragranceUGCService.vote_note_suggestion(
            user=self.other_user,
            suggestion_id=self.note_suggestion.id,
            value=-1,
        )

        self.assertEqual(vote.id, updated_vote.id)
        self.assertEqual(updated_vote.value, -1)

    def test_same_similarity_vote_twice_rejected(self):
        FragranceUGCService.vote_similarity_suggestion(
            user=self.other_user,
            suggestion_id=self.similarity_suggestion.id,
            value=1,
        )

        with self.assertRaises(ValidationError):
            FragranceUGCService.vote_similarity_suggestion(
                user=self.other_user,
                suggestion_id=self.similarity_suggestion.id,
                value=1,
            )

    def test_similarity_vote_can_be_changed(self):
        vote = FragranceUGCService.vote_similarity_suggestion(
            user=self.other_user,
            suggestion_id=self.similarity_suggestion.id,
            value=1,
        )

        updated_vote = FragranceUGCService.vote_similarity_suggestion(
            user=self.other_user,
            suggestion_id=self.similarity_suggestion.id,
            value=-1,
        )

        self.assertEqual(vote.id, updated_vote.id)
        self.assertEqual(updated_vote.value, -1)
