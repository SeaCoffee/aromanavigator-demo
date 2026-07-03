from __future__ import annotations

from collections import defaultdict

from django.contrib.contenttypes.models import ContentType
from django.db.models import QuerySet

from .models import LikeModel


def like_queryset(*, user=None) -> QuerySet[LikeModel]:
    qs = LikeModel.objects.select_related("content_type")

    if user is not None:
        qs = qs.filter(user=user)

    return qs.order_by("-created_at")


def user_likes_queryset(*, user) -> QuerySet[LikeModel]:
    return like_queryset(user=user)


def get_target_content_type(target) -> ContentType:
    return ContentType.objects.get_for_model(
        target,
        for_concrete_model=False,
    )


def build_user_like_for_targets_map(
    *,
    user,
    content_type: ContentType,
    object_ids: list[int],
) -> dict[int, int]:
    if not object_ids:
        return {}

    if not user or not getattr(user, "is_authenticated", False):
        return {}

    rows = (
        LikeModel.objects
        .filter(
            user=user,
            content_type=content_type,
            object_id__in=object_ids,
        )
        .values_list("object_id", "id")
    )

    return {
        int(object_id): int(like_id)
        for object_id, like_id in rows
    }


def build_like_targets_map(likes: list[LikeModel]) -> dict[tuple[int, int], object]:
    """
    Р”Р»СЏ LikeSerializer СЃРїРёСЃРєР°, С‡С‚РѕР±С‹ РЅРµ РґРµР»Р°С‚СЊ content_object N+1.
    РљР»СЋС‡: (content_type_id, object_id)
    """

    grouped: dict[int, list[int]] = defaultdict(list)

    for like in likes:
        grouped[like.content_type_id].append(like.object_id)

    result: dict[tuple[int, int], object] = {}

    for content_type_id, object_ids in grouped.items():
        content_type = ContentType.objects.filter(id=content_type_id).first()

        if content_type is None:
            continue

        model_class = content_type.model_class()

        if model_class is None:
            continue

        objects = model_class.objects.filter(id__in=object_ids)

        for obj in objects:
            result[(content_type_id, obj.pk)] = obj

    return result
