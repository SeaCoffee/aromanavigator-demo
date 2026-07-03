# apps/fragrance_ugc/tests/test_ugc_serializers.py

from django.test import TestCase

from apps.fragrance_ugc.serializers import (
    UserFragranceNoteVoteSerializer,
    FragranceSimilaritySuggestionCreateSerializer,
    FragranceSimilarityVoteSerializer,
    FragranceAddRequestCreateSerializer,
)


class FragranceUGCSerializersTest(TestCase):
    def test_note_vote_serializer_valid(self):
        serializer = UserFragranceNoteVoteSerializer(
            data={"suggestion_id": 1, "value": 1}
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_note_vote_serializer_invalid_value(self):
        serializer = UserFragranceNoteVoteSerializer(
            data={"suggestion_id": 1, "value": 5}
        )
        self.assertFalse(serializer.is_valid())

    def test_similarity_serializer_rejects_self(self):
        serializer = FragranceSimilaritySuggestionCreateSerializer(
            data={"similar_fragrance_id": 1},
            context={"fragrance_id": 1},
        )
        self.assertFalse(serializer.is_valid())

    def test_similarity_vote_serializer_invalid_value(self):
        serializer = FragranceSimilarityVoteSerializer(
            data={"suggestion_id": 1, "value": 0}
        )
        self.assertFalse(serializer.is_valid())

    def test_add_request_serializer_valid(self):
        serializer = FragranceAddRequestCreateSerializer(
            data={
                "brand_name": "Guerlain",
                "fragrance_name": "Shalimar",
                "release_year": 1925,
                "perfumers_text": "Jacques Guerlain",
                "notes_text": "vanilla, iris",
                "families_text": "oriental",
                "links_text": "",
            }
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_add_request_serializer_invalid_empty_names(self):
        serializer = FragranceAddRequestCreateSerializer(
            data={
                "brand_name": "   ",
                "fragrance_name": "",
                "release_year": 1925,
            }
        )
        self.assertFalse(serializer.is_valid())
