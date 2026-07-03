from __future__ import annotations

from collections import defaultdict
from typing import Any

from django.contrib.contenttypes.models import ContentType

from apps.photos.media_urls import stored_image_url
from apps.photos.models import ObjectCoverModel, ObjectPhotoModel


TYPED_PHOTO_COVER_PRIORITY = {
    "full": 0,
    "bottom": 1,
    "laser": 2,
    "sprayer": 3,
}


def build_object_photos_map(*, ct_id: int, obj_ids: list[int]) -> dict[int, dict[str, Any]]:
    """
    Р’РѕР·РІСЂР°С‰Р°РµС‚:
    {
        obj_id: {
            "cover": ObjectCoverModel | None,
            "attachments": list[ObjectPhotoModel],
        }
    }
    """
    clean_obj_ids = list(dict.fromkeys(int(obj_id) for obj_id in obj_ids if obj_id))

    if not clean_obj_ids:
        return {}

    covers_qs = (
        ObjectCoverModel.objects
        .filter(content_type_id=ct_id, object_id__in=clean_obj_ids)
        .only("id", "content_type_id", "object_id", "image", "created_at", "updated_at")
    )
    cover_map = {cover.object_id: cover for cover in covers_qs}

    attachments_qs = (
        ObjectPhotoModel.objects
        .filter(content_type_id=ct_id, object_id__in=clean_obj_ids)
        .only(
            "id",
            "content_type_id",
            "object_id",
            "position",
            "image",
            "created_at",
            "updated_at",
        )
        .order_by("object_id", "position", "id")
    )

    attachments_map: dict[int, list[ObjectPhotoModel]] = defaultdict(list)

    for attachment in attachments_qs:
        attachments_map[attachment.object_id].append(attachment)

    return {
        obj_id: {
            "cover": cover_map.get(obj_id),
            "attachments": attachments_map.get(obj_id, []),
        }
        for obj_id in clean_obj_ids
    }


def attach_object_photos(
    items: list,
    *,
    cover_attr: str = "prefetched_cover",
    cover_image_attr: str = "prefetched_cover_image",
) -> list:
    if not items:
        return items

    content_type = ContentType.objects.get_for_model(
        items[0],
        for_concrete_model=False,
    )
    photos_map = build_object_photos_map(
        ct_id=content_type.id,
        obj_ids=[item.pk for item in items],
    )

    for item in items:
        cover = (photos_map.get(item.pk) or {}).get("cover")
        setattr(item, cover_attr, cover)
        setattr(
            item,
            cover_image_attr,
            stored_image_url(cover.image) if cover else None,
        )

    return items


def object_cover_for(obj):
    prefetched = getattr(obj, "prefetched_object_cover", None)

    if prefetched is not None:
        return prefetched

    content_type = ContentType.objects.get_for_model(obj, for_concrete_model=False)
    return (
        ObjectCoverModel.objects
        .filter(content_type=content_type, object_id=obj.pk)
        .only("id", "image")
        .first()
    )


def object_cover_image_url(obj) -> str:
    cover = object_cover_for(obj)
    return stored_image_url(cover.image, default="") if cover else ""


def typed_photo_cover_for(obj):
    photo_manager = getattr(obj, "photos", None)

    if photo_manager is None:
        return None

    photos = list(photo_manager.all())

    if not photos:
        return None

    return min(
        photos,
        key=lambda photo: (
            TYPED_PHOTO_COVER_PRIORITY.get(photo.type, 99),
            photo.id,
        ),
    )


def typed_photo_cover_image_url(obj) -> str:
    photo = typed_photo_cover_for(obj)
    return stored_image_url(photo.image, default="") if photo else ""
