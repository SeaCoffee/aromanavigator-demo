from __future__ import annotations

from collections import defaultdict

from django.contrib.contenttypes.models import ContentType
from django.db.models import QuerySet

from apps.likes.models import LikeModel
from apps.photos.selectors import build_object_photos_map
from apps.tags.models import TaggedItemModel

from .models import ForumSectionModel, ForumTopicModel


def section_queryset(*, user=None) -> QuerySet[ForumSectionModel]:
    qs = ForumSectionModel.objects.all()

    if user and getattr(user, "is_authenticated", False) and getattr(user, "is_staff", False):
        return qs

    return qs.filter(is_active=True)


def topic_queryset(*, user=None) -> QuerySet[ForumTopicModel]:
    return (
        ForumTopicModel.objects
        .select_related("section", "author", "author__profile")
        .visible(user)
    )


def topic_list_queryset(
    *,
    user=None,
    section: str | None = None,
    tag: str | None = None,
) -> QuerySet[ForumTopicModel]:
    return (
        topic_queryset(user=user)
        .by_section(section)
        .by_tag(tag)
    )


def build_topic_tags_map(topic_ids: list[int]) -> dict[int, list[str]]:
    if not topic_ids:
        return {}

    content_type = ContentType.objects.get_for_model(
        ForumTopicModel,
        for_concrete_model=False,
    )

    rows = (
        TaggedItemModel.objects
        .filter(content_type=content_type, object_id__in=topic_ids)
        .select_related("tag")
        .order_by("tag__code")
        .values_list("object_id", "tag__code")
    )

    result: dict[int, list[str]] = defaultdict(list)

    for object_id, tag_code in rows:
        if tag_code:
            result[int(object_id)].append(str(tag_code))

    return dict(result)


def build_topic_my_likes_map(user, topic_ids: list[int]) -> dict[int, int]:
    if not topic_ids:
        return {}

    if not user or not getattr(user, "is_authenticated", False):
        return {}

    content_type = ContentType.objects.get_for_model(
        ForumTopicModel,
        for_concrete_model=False,
    )

    rows = (
        LikeModel.objects
        .filter(
            user=user,
            content_type=content_type,
            object_id__in=topic_ids,
        )
        .values_list("object_id", "id")
    )

    return {
        int(object_id): int(like_id)
        for object_id, like_id in rows
    }


def build_section_serializer_context(*, section_ids: list[int]) -> dict:
    content_type = ContentType.objects.get_for_model(
        ForumSectionModel,
        for_concrete_model=False,
    )

    return {
        "object_photos_map": build_object_photos_map(
            ct_id=content_type.id,
            obj_ids=section_ids,
        ),
    }


def build_topic_serializer_context(*, user, topic_ids: list[int]) -> dict:
    content_type = ContentType.objects.get_for_model(
        ForumTopicModel,
        for_concrete_model=False,
    )

    my_likes_map = build_topic_my_likes_map(user, topic_ids)

    return {
        "object_photos_map": build_object_photos_map(
            ct_id=content_type.id,
            obj_ids=topic_ids,
        ),
        "topic_tags_map": build_topic_tags_map(topic_ids),
        "liked_topic_ids": set(my_likes_map.keys()),
        "topic_my_likes_map": my_likes_map,
    }
