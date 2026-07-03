# apps/wardrobe/models.py

from django.conf import settings
from django.db import models
from django.db.models import Index, Q, UniqueConstraint

from core.choises.wardrobe_status_choise import WardrobeStatus
from core.models import BaseModel


class WardrobeItemModel(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wardrobe",
    )

    fragrance = models.ForeignKey(
        "fragrance.FragranceModel",
        on_delete=models.PROTECT,
        related_name="wardrobe_items",
    )

    status = models.CharField(
        max_length=20,
        choices=WardrobeStatus.choices,
        default=WardrobeStatus.OWN,
    )

    rating = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    is_private = models.BooleanField(default=False)

    class Meta:
        db_table = "wardrobe_item"
        ordering = ["fragrance__brand__name", "fragrance__name", "status"]
        constraints = [
            models.CheckConstraint(
                name="wardrobe_rating_between_1_10_or_null",
                condition=Q(rating__isnull=True) | Q(rating__gte=1, rating__lte=10),
            ),
            UniqueConstraint(
                fields=["user", "fragrance", "status"],
                name="ux_wardrobe_user_fragrance_status",
            ),
        ]
        indexes = [
            Index(
                fields=["user", "-updated_at"],
                name="idx_wardrobe_user_updated",
            ),
            Index(
                fields=["user", "is_private", "-updated_at"],
                name="idx_wrd_user_priv_upd",
            ),
            Index(
                fields=["user", "fragrance", "status"],
                name="idx_wrd_user_fr_status",
            ),
        ]

    def __str__(self):
        return f"{self.fragrance} вЂ” {self.get_status_display()}"
