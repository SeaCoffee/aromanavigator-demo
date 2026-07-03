from __future__ import annotations

from dataclasses import dataclass

from django.core.files.storage import default_storage
from django.db import transaction

from apps.photos.models import (
    ObjectCoverModel,
    ObjectPhotoModel,
    PerfumePhotoModel,
    PrivateObjectPhotoModel,
)


PHOTO_MODELS = (
    ObjectCoverModel,
    ObjectPhotoModel,
    PerfumePhotoModel,
    PrivateObjectPhotoModel,
)


@dataclass
class StorageNormalizationResult:
    scanned: int = 0
    moved: int = 0
    missing: int = 0
    skipped: int = 0


class PhotoStorageService:
    @staticmethod
    def normalize_paths(*, dry_run: bool = False) -> StorageNormalizationResult:
        result = StorageNormalizationResult()

        for model in PHOTO_MODELS:
            for photo in model.objects.select_related("content_type").iterator():
                result.scanned += 1
                field_file = photo.image
                old_name = field_file.name

                if not old_name or old_name.replace("\\", "/").startswith("photos/"):
                    result.skipped += 1
                    continue

                storage = field_file.storage
                source_storage = storage

                if not storage.exists(old_name):
                    if model is PrivateObjectPhotoModel and default_storage.exists(old_name):
                        source_storage = default_storage
                    else:
                        result.missing += 1
                        continue

                if dry_run:
                    result.moved += 1
                    continue

                field = photo._meta.get_field("image")
                new_name = field.generate_filename(photo, "image.jpg")

                with source_storage.open(old_name, "rb") as source:
                    saved_name = storage.save(new_name, source)

                try:
                    with transaction.atomic():
                        model.objects.filter(pk=photo.pk).update(image=saved_name)
                except Exception:
                    storage.delete(saved_name)
                    raise

                source_storage.delete(old_name)
                result.moved += 1

        return result
