from __future__ import annotations

from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_delete
from django.dispatch import receiver

from apps.photos.models import (
    ObjectCoverModel,
    ObjectPhotoModel,
    PerfumePhotoModel,
    PrivateObjectPhotoModel,
)
from apps.photos.service import PhotoService
from apps.photos.target_registry import PHOTO_TARGET_POLICIES


@receiver(post_delete, dispatch_uid="photos.delete_target_photos")
def delete_target_photos(sender, instance, **kwargs):
    label = getattr(getattr(sender, "_meta", None), "label_lower", "")

    if label not in PHOTO_TARGET_POLICIES or not getattr(instance, "pk", None):
        return

    content_type = ContentType.objects.get_for_model(
        sender,
        for_concrete_model=False,
    )

    for model in (
        ObjectCoverModel,
        ObjectPhotoModel,
        PerfumePhotoModel,
        PrivateObjectPhotoModel,
    ):
        rows = list(
            model.objects
            .filter(content_type=content_type, object_id=instance.pk)
            .only("id", "image")
        )

        for row in rows:
            PhotoService.delete_instance_with_file(row)
