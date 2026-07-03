from __future__ import annotations

from django.db.transaction import atomic

from apps.fragrance_ugc.models import (
    FragranceAddRequestModel,
    FragranceSimilaritySuggestionModel,
    FragranceSimilarityVoteModel,
    UserFragranceNoteSuggestionModel,
    UserFragranceNoteVoteModel,
)
from core.choises.status_choise import STATUS_CHOISE
from core.validators.fragrance_validators import (
    validate_fragrance_exists,
    validate_note_exists,
    validate_release_year,
)
from core.validators.fragrance_ugc_validators import (
    validate_add_request_payload,
    validate_note_level,
    validate_note_not_already_official,
    validate_note_suggestion_exists,
    validate_note_suggestion_not_exists,
    validate_note_vote_not_same,
    validate_similarity_not_self,
    validate_similarity_suggestion_exists,
    validate_similarity_suggestion_not_exists,
    validate_similarity_vote_not_same,
    validate_suggestion_can_be_voted,
    validate_user_is_not_author,
    validate_vote_value,
)


class FragranceUGCService:
    @staticmethod
    @atomic
    def create_note_suggestion(
        *,
        user,
        fragrance_id: int,
        note_id: int,
        level: str = "top",
    ) -> UserFragranceNoteSuggestionModel:
        fragrance = validate_fragrance_exists(fragrance_id)
        note = validate_note_exists(note_id)
        clean_level = validate_note_level(level)

        validate_note_not_already_official(
            fragrance=fragrance,
            note=note,
            level=clean_level,
        )
        validate_note_suggestion_not_exists(
            fragrance=fragrance,
            note=note,
            user_id=user.id,
            level=clean_level,
        )

        return UserFragranceNoteSuggestionModel.objects.create(
            fragrance=fragrance,
            note=note,
            created_by=user,
            level=clean_level,
            status=STATUS_CHOISE.PENDING,
        )

    @staticmethod
    @atomic
    def vote_note_suggestion(
        *,
        user,
        suggestion_id: int,
        value: int,
    ) -> UserFragranceNoteVoteModel:
        suggestion = validate_note_suggestion_exists(suggestion_id)
        clean_value = validate_vote_value(value)

        validate_suggestion_can_be_voted(suggestion.status)
        validate_user_is_not_author(
            user_id=user.id,
            created_by_id=suggestion.created_by_id,
        )

        vote, created = UserFragranceNoteVoteModel.objects.get_or_create(
            suggestion=suggestion,
            user=user,
            defaults={"value": clean_value},
        )

        if not created:
            validate_note_vote_not_same(vote, clean_value)
            vote.value = clean_value
            vote.save(update_fields=["value", "updated_at"])

        return vote

    @staticmethod
    @atomic
    def create_similarity_suggestion(
        *,
        user,
        fragrance_id: int,
        similar_fragrance_id: int,
    ) -> FragranceSimilaritySuggestionModel:
        validate_similarity_not_self(fragrance_id, similar_fragrance_id)

        fragrance = validate_fragrance_exists(fragrance_id)
        similar_fragrance = validate_fragrance_exists(similar_fragrance_id)

        validate_similarity_suggestion_not_exists(
            fragrance=fragrance,
            similar_fragrance=similar_fragrance,
            user_id=user.id,
        )

        return FragranceSimilaritySuggestionModel.objects.create(
            fragrance=fragrance,
            similar_fragrance=similar_fragrance,
            created_by=user,
            status=STATUS_CHOISE.PENDING,
        )

    @staticmethod
    @atomic
    def vote_similarity_suggestion(
        *,
        user,
        suggestion_id: int,
        value: int,
    ) -> FragranceSimilarityVoteModel:
        suggestion = validate_similarity_suggestion_exists(suggestion_id)
        clean_value = validate_vote_value(value)

        validate_suggestion_can_be_voted(suggestion.status)
        validate_user_is_not_author(
            user_id=user.id,
            created_by_id=suggestion.created_by_id,
        )

        vote, created = FragranceSimilarityVoteModel.objects.get_or_create(
            suggestion=suggestion,
            user=user,
            defaults={"value": clean_value},
        )

        if not created:
            validate_similarity_vote_not_same(vote, clean_value)
            vote.value = clean_value
            vote.save(update_fields=["value", "updated_at"])

        return vote

    @staticmethod
    @atomic
    def create_add_request(*, user, payload: dict) -> FragranceAddRequestModel:
        clean_payload = validate_add_request_payload(payload)

        return FragranceAddRequestModel.objects.create(
            created_by=user,
            brand_name=clean_payload["brand_name"],
            fragrance_name=clean_payload["fragrance_name"],
            release_year=validate_release_year(payload.get("release_year")),
            perfumers_text=clean_payload["perfumers_text"],
            notes_text=clean_payload["notes_text"],
            families_text=clean_payload["families_text"],
            links_text=clean_payload["links_text"],
            status=STATUS_CHOISE.PENDING,
        )
