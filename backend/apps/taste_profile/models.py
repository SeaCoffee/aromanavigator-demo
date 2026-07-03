from django.conf import settings
from django.db import models
from django.db.models import Index, UniqueConstraint

from core.models import BaseModel
from core.choises.taste_profile_choise import (
    TasteAttitude,
    TasteConcentration,
    TasteFragranceMark,
    TastePriority,
    TasteSeason,
)


class TasteProfileModel(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="taste_profile",
    )

    is_public = models.BooleanField(default=True)

    about = models.TextField(
        max_length=700,
        blank=True,
        default="",
    )

    class Meta:
        db_table = "taste_profile"
        ordering = ["id"]
        indexes = [
            Index(fields=["user"], name="idx_taste_profile_user"),
            Index(fields=["is_public"], name="idx_taste_profile_public"),
        ]

    def __str__(self) -> str:
        return f"Taste profile #{self.id} for user #{self.user_id}"


class TasteFamilyPreferenceModel(BaseModel):
    profile = models.ForeignKey(
        TasteProfileModel,
        on_delete=models.CASCADE,
        related_name="family_preferences",
    )

    family = models.ForeignKey(
        "fragrance.OlfactoryFamilyModel",
        on_delete=models.PROTECT,
        related_name="taste_preferences",
    )

    attitude = models.CharField(
        max_length=20,
        choices=TasteAttitude.choices,
    )

    comment = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    class Meta:
        db_table = "taste_family_preference"
        ordering = ["family__name", "id"]
        constraints = [
            UniqueConstraint(
                fields=["profile", "family"],
                name="uq_taste_profile_family",
            ),
        ]
        indexes = [
            Index(fields=["profile", "attitude"], name="idx_taste_family_prof_att"),
            Index(fields=["family", "attitude"], name="idx_taste_family_att"),
        ]

    def __str__(self) -> str:
        return f"{self.profile_id}: {self.family} вЂ” {self.attitude}"


class TasteNotePreferenceModel(BaseModel):
    profile = models.ForeignKey(
        TasteProfileModel,
        on_delete=models.CASCADE,
        related_name="note_preferences",
    )

    note = models.ForeignKey(
        "fragrance.NoteModel",
        on_delete=models.PROTECT,
        related_name="taste_preferences",
    )

    attitude = models.CharField(
        max_length=20,
        choices=TasteAttitude.choices,
    )

    comment = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    class Meta:
        db_table = "taste_note_preference"
        ordering = ["note__name", "id"]
        constraints = [
            UniqueConstraint(
                fields=["profile", "note"],
                name="uq_taste_profile_note",
            ),
        ]
        indexes = [
            Index(fields=["profile", "attitude"], name="idx_taste_note_prof_att"),
            Index(fields=["note", "attitude"], name="idx_taste_note_att"),
        ]

    def __str__(self) -> str:
        return f"{self.profile_id}: {self.note} вЂ” {self.attitude}"


class TastePerfumerPreferenceModel(BaseModel):
    profile = models.ForeignKey(
        TasteProfileModel,
        on_delete=models.CASCADE,
        related_name="perfumer_preferences",
    )

    perfumer = models.ForeignKey(
        "fragrance.PerfumerModel",
        on_delete=models.PROTECT,
        related_name="taste_preferences",
    )

    attitude = models.CharField(
        max_length=20,
        choices=TasteAttitude.choices,
    )

    comment = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    class Meta:
        db_table = "taste_perfumer_preference"
        ordering = ["perfumer__name", "id"]
        constraints = [
            UniqueConstraint(
                fields=["profile", "perfumer"],
                name="uq_taste_profile_perfumer",
            ),
        ]
        indexes = [
            Index(fields=["profile", "attitude"], name="idx_taste_perf_prof_att"),
            Index(fields=["perfumer", "attitude"], name="idx_taste_perf_att"),
        ]

    def __str__(self) -> str:
        return f"{self.profile_id}: {self.perfumer} вЂ” {self.attitude}"


class TasteBrandPreferenceModel(BaseModel):
    profile = models.ForeignKey(
        TasteProfileModel,
        on_delete=models.CASCADE,
        related_name="brand_preferences",
    )

    brand = models.ForeignKey(
        "fragrance.BrandModel",
        on_delete=models.PROTECT,
        related_name="taste_preferences",
    )

    attitude = models.CharField(
        max_length=20,
        choices=TasteAttitude.choices,
    )

    comment = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    class Meta:
        db_table = "taste_brand_preference"
        ordering = ["brand__name", "id"]
        constraints = [
            UniqueConstraint(
                fields=["profile", "brand"],
                name="uq_taste_profile_brand",
            ),
        ]
        indexes = [
            Index(fields=["profile", "attitude"], name="idx_taste_brand_prof_att"),
            Index(fields=["brand", "attitude"], name="idx_taste_brand_att"),
        ]

    def __str__(self) -> str:
        return f"{self.profile_id}: {self.brand} вЂ” {self.attitude}"


class TasteSeasonPreferenceModel(BaseModel):
    profile = models.ForeignKey(
        TasteProfileModel,
        on_delete=models.CASCADE,
        related_name="season_preferences",
    )

    season = models.CharField(
        max_length=20,
        choices=TasteSeason.choices,
    )

    attitude = models.CharField(
        max_length=20,
        choices=TasteAttitude.choices,
    )

    comment = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    class Meta:
        db_table = "taste_season_preference"
        ordering = ["season", "id"]
        constraints = [
            UniqueConstraint(
                fields=["profile", "season"],
                name="uq_taste_profile_season",
            ),
        ]
        indexes = [
            Index(fields=["profile", "attitude"], name="idx_taste_season_prof_att"),
            Index(fields=["season", "attitude"], name="idx_taste_season_att"),
        ]

    def __str__(self) -> str:
        return f"{self.profile_id}: {self.season} вЂ” {self.attitude}"


class TasteConcentrationPreferenceModel(BaseModel):
    profile = models.ForeignKey(
        TasteProfileModel,
        on_delete=models.CASCADE,
        related_name="concentration_preferences",
    )

    concentration = models.CharField(
        max_length=20,
        choices=TasteConcentration.choices,
    )

    attitude = models.CharField(
        max_length=20,
        choices=TasteAttitude.choices,
    )

    comment = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    class Meta:
        db_table = "taste_concentration_preference"
        ordering = ["concentration", "id"]
        constraints = [
            UniqueConstraint(
                fields=["profile", "concentration"],
                name="uq_taste_profile_concentration",
            ),
        ]
        indexes = [
            Index(fields=["profile", "attitude"], name="idx_taste_conc_prof_att"),
            Index(fields=["concentration", "attitude"], name="idx_taste_conc_att"),
        ]

    def __str__(self) -> str:
        return f"{self.profile_id}: {self.concentration} вЂ” {self.attitude}"


class TasteFragranceMarkModel(BaseModel):
    profile = models.ForeignKey(
        TasteProfileModel,
        on_delete=models.CASCADE,
        related_name="fragrance_marks",
    )

    fragrance = models.ForeignKey(
        "fragrance.FragranceModel",
        on_delete=models.PROTECT,
        related_name="taste_marks",
    )

    mark = models.CharField(
        max_length=30,
        choices=TasteFragranceMark.choices,
    )

    priority = models.CharField(
        max_length=20,
        choices=TastePriority.choices,
        default=TastePriority.NORMAL,
    )

    comment = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    class Meta:
        db_table = "taste_fragrance_mark"
        ordering = ["mark", "-updated_at", "id"]
        constraints = [
            UniqueConstraint(
                fields=["profile", "fragrance"],
                name="uq_taste_profile_fragrance",
            ),
        ]
        indexes = [
            Index(fields=["profile", "mark", "-updated_at"], name="idx_taste_fr_prof_mark_upd"),
            Index(fields=["fragrance", "mark"], name="idx_taste_fragrance_mark"),
            Index(fields=["profile", "priority"], name="idx_taste_fr_prof_priority"),
        ]

    def __str__(self) -> str:
        return f"{self.profile_id}: {self.fragrance} вЂ” {self.mark}"
