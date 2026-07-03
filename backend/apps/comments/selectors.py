from __future__ import annotations

from collections import defaultdict
from typing import Iterable

from django.contrib.contenttypes.models import ContentType
from django.db.models import QuerySet

from apps.likes.models import LikeModel
from apps.photos.selectors import build_object_photos_map

from apps.comments.constants import MAX_COMMENT_TREE_DEPTH
from apps.comments.models import CommentModel
from apps.comments.rules import is_comment_target_allowed


def comment_content_type() -> ContentType:
    return ContentType.objects.get_for_model(
        CommentModel,
        for_concrete_model=False,
    )


def resolve_comment_target_params(
    *,
    app: str | None,
    model: str | None,
    object_id: str | int | None,
) -> tuple[ContentType, int] | None:
    if not app or not model or not object_id:
        return None

    try:
        object_id_int = int(object_id)
    except (TypeError, ValueError):
        return None

    if object_id_int <= 0:
        return None

    content_type = (
        ContentType.objects
        .filter(app_label=str(app), model=str(model).lower())
        .first()
    )

    if not content_type:
        return None

    if not is_comment_target_allowed(content_type):
        return None

    return content_type, object_id_int


def comment_queryset(*, include_deleted: bool = False) -> QuerySet[CommentModel]:
    qs = (
        CommentModel.objects
        .select_related(
            "user",
            "user__profile",
            "content_type",
            "parent",
            "parent__user",
            "parent__user__profile",
            "parent__content_type",
        )
    )

    if not include_deleted:
        qs = qs.filter(is_deleted=False)

    return qs


def target_comments_queryset(
    *,
    content_type: ContentType,
    object_id: int,
    include_deleted: bool = False,
) -> QuerySet[CommentModel]:
    return (
        comment_queryset(include_deleted=include_deleted)
        .filter(content_type=content_type, object_id=object_id)
        .order_by("created_at", "id")
    )


def target_top_level_comments_queryset(
    *,
    content_type: ContentType,
    object_id: int,
) -> QuerySet[CommentModel]:
    return (
        target_comments_queryset(
            content_type=content_type,
            object_id=object_id,
            include_deleted=False,
        )
        .filter(parent__isnull=True)
        .order_by("created_at", "id")
    )


def build_liked_comment_ids(user, comment_ids: Iterable[int]) -> set[int]:
    ids = [int(item) for item in comment_ids if item]

    if not ids:
        return set()

    if not user or not getattr(user, "is_authenticated", False):
        return set()

    content_type = comment_content_type()

    return set(
        LikeModel.objects
        .filter(
            user=user,
            content_type=content_type,
            object_id__in=ids,
        )
        .values_list("object_id", flat=True)
    )


def build_comment_my_likes_map(user, comment_ids: Iterable[int]) -> dict[int, int]:
    ids = [int(item) for item in comment_ids if item]

    if not ids:
        return {}

    if not user or not getattr(user, "is_authenticated", False):
        return {}

    content_type = comment_content_type()

    rows = (
        LikeModel.objects
        .filter(
            user=user,
            content_type=content_type,
            object_id__in=ids,
        )
        .values_list("object_id", "id")
    )

    return {
        int(object_id): int(like_id)
        for object_id, like_id in rows
    }


def build_comment_serializer_context(
    *,
    user,
    comment_ids: list[int],
    include_photos: bool = True,
) -> dict:
    context = {
        "liked_comment_ids": build_liked_comment_ids(user, comment_ids),
        "comment_my_likes_map": build_comment_my_likes_map(user, comment_ids),
    }

    if include_photos:
        content_type = comment_content_type()
        context["object_photos_map"] = build_object_photos_map(
            ct_id=content_type.id,
            obj_ids=comment_ids,
        )

    return context


def flatten_thread_comment_ids(comments) -> list[int]:
    ids: list[int] = []

    def walk(comment):
        ids.append(comment.id)

        for reply in getattr(comment, "prefetched_replies", None) or []:
            walk(reply)

    for comment in comments:
        walk(comment)

    return list(dict.fromkeys(ids))


def attach_replies_tree(
    *,
    top_comments: list[CommentModel],
    content_type: ContentType,
    object_id: int,
) -> list[CommentModel]:
    """
    Legacy tree mode.

    Р¤РѕСЂСѓРј РґР°Р»СЊС€Рµ Р»СѓС‡С€Рµ РѕС‚РґР°РІР°С‚СЊ РїР»РѕСЃРєРёРј СЃРїРёСЃРєРѕРј С‡РµСЂРµР· target_comments_queryset().
    Р­С‚Р° С„СѓРЅРєС†РёСЏ РѕСЃС‚Р°РІР»РµРЅР° РґР»СЏ СЃС‚Р°СЂРѕРіРѕ tree endpoint Рё РґСЂСѓРіРёС… РІРѕР·РјРѕР¶РЅС‹С… РјРµСЃС‚,
    РЅРѕ РіР»СѓР±РёРЅР° С‚РµРїРµСЂСЊ РЅРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєР°СЏ "3", Р° С‚РµС…РЅРёС‡РµСЃРєРёР№ safety limit.
    """
    if not top_comments:
        return top_comments

    frontier_ids = [comment.id for comment in top_comments]
    all_replies: list[CommentModel] = []

    for _ in range(MAX_COMMENT_TREE_DEPTH - 1):
        if not frontier_ids:
            break

        replies = list(
            comment_queryset(include_deleted=False)
            .filter(
                content_type=content_type,
                object_id=object_id,
                parent_id__in=frontier_ids,
            )
            .order_by("created_at", "id")
        )

        if not replies:
            break

        all_replies.extend(replies)
        frontier_ids = [reply.id for reply in replies]

    children_map: dict[int, list[CommentModel]] = defaultdict(list)

    for reply in all_replies:
        if reply.parent_id:
            children_map[reply.parent_id].append(reply)

    for comment in [*top_comments, *all_replies]:
        comment.prefetched_replies = children_map.get(comment.id, [])

    return top_comments
