from __future__ import annotations

from django.contrib.contenttypes.models import ContentType
from django.db.models import Q

from apps.forum.models import ForumTopicModel
from apps.social.models import BlockModel, SubscriptionModel


def exclude_blocked_user_ids(
    *,
    actor_id: int,
    user_ids: set[int],
) -> set[int]:
    if not actor_id or not user_ids:
        return set()

    blocked_pairs = set(
        BlockModel.objects
        .filter(
            Q(blocker_id=actor_id, blocked_id__in=user_ids)
            |
            Q(blocked_id=actor_id, blocker_id__in=user_ids)
        )
        .values_list("blocker_id", "blocked_id")
    )

    blocked_user_ids = {
        user_id
        for pair in blocked_pairs
        for user_id in pair
        if user_id != actor_id
    }

    return {
        user_id
        for user_id in user_ids
        if user_id not in blocked_user_ids
    }


def target_owner_id(target) -> int | None:
    return (
        getattr(target, "author_id", None)
        or getattr(target, "owner_id", None)
        or getattr(target, "user_id", None)
    )


def forum_topic_subscriber_user_ids(
    *,
    topic: ForumTopicModel,
    actor_id: int,
    exclude_ids: set[int] | None = None,
) -> set[int]:
    excluded = set(exclude_ids or set())
    excluded.add(actor_id)

    content_type = ContentType.objects.get_for_model(
        ForumTopicModel,
        for_concrete_model=False,
    )

    user_ids = set(
        SubscriptionModel.objects
        .filter(
            content_type=content_type,
            object_id=topic.id,
        )
        .exclude(user_id__in=excluded)
        .values_list("user_id", flat=True)
    )

    return exclude_blocked_user_ids(
        actor_id=actor_id,
        user_ids=user_ids,
    )


def comment_activity_notify_user_ids(
    *,
    actor_id: int,
    target,
    parent=None,
    already_notified_user_ids: set[int] | None = None,
) -> list[int]:
    excluded = set(already_notified_user_ids or set())
    excluded.add(actor_id)

    user_ids: set[int] = set()

    owner_id = target_owner_id(target)

    if owner_id and owner_id not in excluded:
        user_ids.add(owner_id)

    if parent and parent.user_id and parent.user_id not in excluded:
        user_ids.add(parent.user_id)

    if isinstance(target, ForumTopicModel):
        user_ids.update(
            forum_topic_subscriber_user_ids(
                topic=target,
                actor_id=actor_id,
                exclude_ids=excluded,
            )
        )

    user_ids.discard(actor_id)

    return sorted(
        exclude_blocked_user_ids(
            actor_id=actor_id,
            user_ids=user_ids,
        )
    )
