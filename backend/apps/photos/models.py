from __future__ import annotations

from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from core.choises.photo_type import PHOTO_TYPE_CHOICES
from core.models import BaseModel
from core.validators.file_extention_validator import validate_image_extension
from .paths import (
    upload_object_cover,
    upload_object_photo,
    upload_private_object_photo,
    upload_typed_perfume_photo,
)
from .storages import private_photo_storage


class PerfumePhotoModel(BaseModel):
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="+",
    )
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    type = models.CharField(
        max_length=20,
        choices=PHOTO_TYPE_CHOICES,
    )
    image = models.ImageField(
        upload_to=upload_typed_perfume_photo,
        max_length=255,
        validators=[validate_image_extension],
    )

    class Meta:
        db_table = "perfume_photo"
        constraints = [
            models.UniqueConstraint(
                fields=["content_type", "object_id", "type"],
                name="uniq_photo_per_object_type",
            ),
        ]
        indexes = [
            models.Index(
                fields=["content_type", "object_id"],
                name="idx_perfphoto_obj",
            ),
        ]
        ordering = ("type", "id")

    def __str__(self) -> str:
        return f"{self.content_type_id}:{self.object_id}:{self.type}"


class ObjectPhotoModel(BaseModel):
    """
    Attachments: РЅРµСЃРєРѕР»СЊРєРѕ С„РѕС‚Рѕ РЅР° РѕР±СЉРµРєС‚.
    РќР°РїСЂРёРјРµСЂ: forum topic/comment/post/etc.
    """

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="+",
    )
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    position = models.PositiveIntegerField(default=0)
    image = models.ImageField(
        upload_to=upload_object_photo,
        max_length=255,
        validators=[validate_image_extension],
    )

    class Meta:
        db_table = "object_photo"
        indexes = [
            models.Index(
                fields=["content_type", "object_id", "position"],
                name="idx_objphoto_obj_pos",
            ),
        ]
        ordering = ("position", "id")

    def __str__(self) -> str:
        return f"{self.content_type_id}:{self.object_id}:photo:{self.id}"


class ObjectCoverModel(BaseModel):
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="+",
    )
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    image = models.ImageField(
        upload_to=upload_object_cover,
        max_length=255,
        validators=[validate_image_extension],
    )

    class Meta:
        db_table = "object_cover"
        constraints = [
            models.UniqueConstraint(
                fields=["content_type", "object_id"],
                name="uniq_cover_per_object",
            ),
        ]
        indexes = [
            models.Index(
                fields=["content_type", "object_id"],
                name="idx_objcover_obj",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.content_type_id}:{self.object_id}:cover"


class PrivateObjectPhotoModel(BaseModel):
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="+",
    )
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    position = models.PositiveIntegerField(default=0)
    image = models.ImageField(
        upload_to=upload_private_object_photo,
        max_length=255,
        storage=private_photo_storage,
        validators=[validate_image_extension],
    )
    original_name = models.CharField(max_length=255, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)
    size = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "private_object_photo"
        indexes = [
            models.Index(
                fields=["content_type", "object_id", "position"],
                name="idx_privatephoto_obj_pos",
            ),
        ]
        ordering = ("position", "id")

    def __str__(self) -> str:
        return f"{self.content_type_id}:{self.object_id}:private-photo:{self.id}"
