from __future__ import annotations

from django.conf import settings
from django.db import models

from apps.fragrance.models import FragranceModel, NoteModel
from core.choises.status_choise import STATUS_CHOISE
from core.choises.note_level_choise import NOTE_LEVEL_CHOICES
from core.models import BaseModel

from apps.fragrance_ugc.manager import (
    FragranceAddRequestQuerySet,
    FragranceSimilaritySuggestionQuerySet,
    UserFragranceNoteSuggestionQuerySet,
)


class UserFragranceNoteSuggestionModel(BaseModel):
    fragrance = models.ForeignKey(
        FragranceModel,
        on_delete=models.CASCADE,
        related_name="note_suggestions",
    )
    note = models.ForeignKey(
        NoteModel,
        on_delete=models.PROTECT,
        related_name="fragrance_suggestions",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="fragrance_note_suggestions",
    )
    level = models.CharField(
        max_length=20,
        choices=NOTE_LEVEL_CHOICES,
        default="top",
    )
    status = models.CharField(
        max_length=40,
        choices=STATUS_CHOISE.choices,
        default=STATUS_CHOISE.PENDING,
    )
    moderator_comment = models.CharField(max_length=500, blank=True, default="")

    objects = UserFragranceNoteSuggestionQuerySet.as_manager()

    class Meta:
        db_table = "fragrance_note_suggestion"
        ordering = ["-created_at", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["fragrance", "note", "created_by", "level"],
                name="uq_fr_note_suggest_user_once_per_level",
            ),
        ]
        indexes = [
            models.Index(
                fields=["fragrance", "status", "created_at"],
                name="idx_fr_note_suggest_fr_st",
            ),
            models.Index(
                fields=["created_by", "created_at"],
                name="idx_fr_note_suggest_user_time",
            ),
            models.Index(
                fields=["fragrance", "level", "created_at"],
                name="idx_fr_note_suggest_fr_lvl",
            ),
        ]


class UserFragranceNoteVoteModel(BaseModel):
    suggestion = models.ForeignKey(
        UserFragranceNoteSuggestionModel,
        on_delete=models.CASCADE,
        related_name="votes",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="fragrance_note_votes",
    )
    value = models.SmallIntegerField(default=1)

    class Meta:
        db_table = "fragrance_note_vote"
        ordering = ["-created_at", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["suggestion", "user"],
                name="uq_fr_note_vote_once",
            ),
            models.CheckConstraint(
                condition=models.Q(value__in=[-1, 1]),
                name="ck_fr_note_vote_value",
            ),
        ]


class FragranceSimilaritySuggestionModel(BaseModel):
    fragrance = models.ForeignKey(
        FragranceModel,
        on_delete=models.CASCADE,
        related_name="similarity_suggestions",
    )
    similar_fragrance = models.ForeignKey(
        FragranceModel,
        on_delete=models.CASCADE,
        related_name="similar_to_suggestions",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="fragrance_similarity_suggestions",
    )
    status = models.CharField(
        max_length=40,
        choices=STATUS_CHOISE.choices,
        default=STATUS_CHOISE.PENDING,
    )
    moderator_comment = models.CharField(max_length=500, blank=True, default="")

    objects = FragranceSimilaritySuggestionQuerySet.as_manager()

    class Meta:
        db_table = "fragrance_similarity_suggestion"
        ordering = ["-created_at", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["fragrance", "similar_fragrance", "created_by"],
                name="uq_fr_sim_suggest_user_once",
            ),
            models.CheckConstraint(
                condition=~models.Q(fragrance=models.F("similar_fragrance")),
                name="ck_fr_sim_not_self",
            ),
        ]
        indexes = [
            models.Index(
                fields=["fragrance", "status", "created_at"],
                name="idx_fr_sim_suggest_fr_st",
            ),
            models.Index(
                fields=["created_by", "created_at"],
                name="idx_fr_sim_suggest_user_time",
            ),
        ]


class FragranceSimilarityVoteModel(BaseModel):
    suggestion = models.ForeignKey(
        FragranceSimilaritySuggestionModel,
        on_delete=models.CASCADE,
        related_name="votes",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="fragrance_similarity_votes",
    )
    value = models.SmallIntegerField(default=1)

    class Meta:
        db_table = "fragrance_similarity_vote"
        ordering = ["-created_at", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["suggestion", "user"],
                name="uq_fr_sim_vote_once",
            ),
            models.CheckConstraint(
                condition=models.Q(value__in=[-1, 1]),
                name="ck_fr_sim_vote_value",
            ),
        ]


class FragranceAddRequestModel(BaseModel):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="fragrance_add_requests",
    )

    brand_name = models.CharField(max_length=255)
    fragrance_name = models.CharField(max_length=255)
    release_year = models.PositiveSmallIntegerField(null=True, blank=True)

    perfumers_text = models.CharField(max_length=500, blank=True, default="")
    notes_text = models.TextField(blank=True, default="")
    families_text = models.CharField(max_length=500, blank=True, default="")
    links_text = models.TextField(blank=True, default="")

    status = models.CharField(
        max_length=32,
        choices=STATUS_CHOISE.choices,
        default=STATUS_CHOISE.PENDING,
    )
    moderator_comment = models.CharField(max_length=500, blank=True, default="")
    created_fragrance = models.ForeignKey(
        FragranceModel,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="source_add_requests",
    )
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="processed_fragrance_add_requests",
    )

    objects = FragranceAddRequestQuerySet.as_manager()

    class Meta:
        db_table = "fragrance_add_request"
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(
                fields=["status", "created_at"],
                name="idx_fr_addreq_status_time",
            ),
            models.Index(
                fields=["created_by", "created_at"],
                name="idx_fr_addreq_user_time",
            ),
            models.Index(
                fields=["brand_name", "fragrance_name"],
                name="idx_fr_addreq_brand_name",
            ),
        ]
