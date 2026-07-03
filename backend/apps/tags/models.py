from __future__ import annotations

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from core.models import BaseModel

from core.validators.tags_validators import validate_tag_code


class TagModel(BaseModel):
    class Meta:
        db_table = "tag"
        ordering = ("code",)
        indexes = [
            models.Index(fields=["code"], name="idx_tag_code"),
        ]

    code = models.CharField(
        max_length=32,
        unique=True,
        validators=[validate_tag_code],
    )

    def __str__(self) -> str:
        return self.code


class TaggedItemModel(BaseModel):
    """
    РџСЂРёРІСЏР·РєР° С‚РµРіР° Рє Р»СЋР±РѕРјСѓ РѕР±СЉРµРєС‚Сѓ: forum topics, articles, comments Рё С‚.Рґ.
    """

    class Meta:
        db_table = "tagged_item"
        constraints = [
            models.UniqueConstraint(
                fields=["content_type", "object_id", "tag"],
                name="uq_tagged_item_target_tag",
            ),
        ]
        indexes = [
            models.Index(fields=["content_type", "object_id"], name="idx_tagged_target"),
            models.Index(fields=["tag", "created_at"], name="idx_tagged_tag_time"),
        ]

    tag = models.ForeignKey(
        TagModel,
        on_delete=models.CASCADE,
        related_name="items",
    )
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
    )
    object_id = models.PositiveBigIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    def __str__(self) -> str:
        return f"{self.tag_id}@{self.content_type_id}:{self.object_id}"
