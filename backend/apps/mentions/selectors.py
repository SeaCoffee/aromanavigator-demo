from __future__ import annotations

from django.contrib.contenttypes.models import ContentType
from django.db.models import QuerySet

from .models import MentionModel


def mention_content_type_for_object(obj) -> ContentType:
    return ContentType.objects.get_for_model(
        obj,
        for_concrete_model=False,
    )


def mention_queryset() -> QuerySet[MentionModel]:
    return (
        MentionModel.objects
        .select_related("user", "user__profile", "content_type")
        .order_by("-created_at")
    )


def mentions_for_object_queryset(*, obj) -> QuerySet[MentionModel]:
    content_type = mention_content_type_for_object(obj)

    return mention_queryset().filter(
        content_type=content_type,
        object_id=obj.pk,
    )


def mentioned_user_ids_for_object(*, obj) -> set[int]:
    return set(
        mentions_for_object_queryset(obj=obj)
        .values_list("user_id", flat=True)
    )


def user_mentions_queryset(*, user) -> QuerySet[MentionModel]:
    return mention_queryset().filter(user=user)
