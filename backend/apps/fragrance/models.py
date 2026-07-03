from django.db import models

from core.models import BaseModel
from apps.fragrance.manager import FragranceManager
from core.choises.note_level_choise import NOTE_LEVEL_CHOICES


class BrandModel(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    country = models.CharField(max_length=120, blank=True, default="")
    wikidata_id = models.CharField(max_length=32, null=True, blank=True, unique=True)

    class Meta:
        db_table = "fragrance_brand"
        ordering = ["name", "id"]
        indexes = [
            models.Index(fields=["name"], name="idx_fr_brand_name"),
            models.Index(fields=["slug"], name="idx_fr_brand_slug"),
        ]

    def __str__(self) -> str:
        return self.name


class PerfumerModel(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    wikidata_id = models.CharField(max_length=32, null=True, blank=True, unique=True)

    class Meta:
        db_table = "fragrance_perfumer"
        ordering = ["name", "id"]
        indexes = [
            models.Index(fields=["name"], name="idx_fr_perfumer_name"),
        ]

    def __str__(self) -> str:
        return self.name


class NoteModel(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)

    class Meta:
        db_table = "fragrance_note"
        ordering = ["name", "id"]
        indexes = [
            models.Index(fields=["name"], name="idx_fr_note_name"),
            models.Index(fields=["slug"], name="idx_fr_note_slug"),
        ]

    def __str__(self) -> str:
        return self.name


class OlfactoryFamilyModel(BaseModel):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)

    class Meta:
        db_table = "fragrance_family"
        ordering = ["name", "id"]
        indexes = [
            models.Index(fields=["name"], name="idx_fr_family_name"),
            models.Index(fields=["slug"], name="idx_fr_family_slug"),
        ]

    def __str__(self) -> str:
        return self.name


class FragranceModel(BaseModel):
    brand = models.ForeignKey(BrandModel, on_delete=models.PROTECT, related_name="fragrances")

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)

    release_year = models.PositiveSmallIntegerField(null=True, blank=True)
    likes_count = models.PositiveIntegerField(default=0)

    wikidata_id = models.CharField(max_length=32, null=True, blank=True, unique=True)

    perfumers = models.ManyToManyField(
        PerfumerModel,
        through="FragrancePerfumerModel",
        related_name="fragrances",
        blank=True,
    )

    notes_official = models.ManyToManyField(
        NoteModel,
        through="FragranceNoteOfficialModel",
        related_name="fragrances_official",
        blank=True,
    )

    families = models.ManyToManyField(
        OlfactoryFamilyModel,
        through="FragranceFamilyModel",
        related_name="fragrances",
        blank=True,
    )



    class Meta:
        db_table = "fragrance"
        ordering = ["brand__name", "name", "id"]
        constraints = [
            models.UniqueConstraint(fields=["brand", "name"], name="uq_fragrance_brand_name"),
        ]
        indexes = [
            models.Index(fields=["brand", "name"], name="idx_fragrance_brand_name"),
            models.Index(fields=["release_year"], name="idx_fragrance_year"),
            models.Index(fields=["likes_count"], name="idx_fragrance_likes"),
            models.Index(fields=["slug"], name="idx_fragrance_slug"),
        ]

    objects = FragranceManager()

    def __str__(self) -> str:
        return f"{self.brand.name} вЂ” {self.name}"


class FragrancePerfumerModel(BaseModel):
    fragrance = models.ForeignKey(FragranceModel, on_delete=models.CASCADE)
    perfumer = models.ForeignKey(PerfumerModel, on_delete=models.PROTECT)

    class Meta:
        db_table = "fragrance_perfumer_link"
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(fields=["fragrance", "perfumer"], name="uq_fr_perfumer_link"),
        ]
        indexes = [
            models.Index(fields=["fragrance"], name="idx_fr_perf_link_fr"),
            models.Index(fields=["perfumer"], name="idx_fr_perf_link_perf"),
        ]


class FragranceNoteOfficialModel(BaseModel):
    fragrance = models.ForeignKey(
        FragranceModel,
        on_delete=models.CASCADE,
        related_name="official_note_links",
    )
    note = models.ForeignKey(NoteModel, on_delete=models.PROTECT)
    level = models.CharField(max_length=20, choices=NOTE_LEVEL_CHOICES, default="top")
    position = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "fragrance_note_official"
        ordering = ["level", "position", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["fragrance", "note", "level"],
                name="uq_fr_note_official_per_level",
            ),
        ]
        indexes = [
            models.Index(fields=["fragrance", "level", "position"], name="idx_fr_note_off_lvl_pos"),
            models.Index(fields=["note"], name="idx_fr_note_off_note"),
        ]


class FragranceFamilyModel(BaseModel):
    fragrance = models.ForeignKey(FragranceModel, on_delete=models.CASCADE)
    family = models.ForeignKey(OlfactoryFamilyModel, on_delete=models.PROTECT)

    class Meta:
        db_table = "fragrance_family_link"
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(fields=["fragrance", "family"], name="uq_fr_family_link"),
        ]
        indexes = [
            models.Index(fields=["fragrance"], name="idx_fr_family_link_fr"),
            models.Index(fields=["family"], name="idx_fr_family_link_family"),
        ]
