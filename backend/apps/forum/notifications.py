# apps/forum/notifications.py

from __future__ import annotations

from django.contrib.contenttypes.models import ContentType
from django.db.models import Q

from apps.forum.models import ForumSectionModel
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


def section_subscriber_user_ids(
    *,
    section: ForumSectionModel,
    actor_id: int,
    exclude_ids: set[int] | None = None,
) -> list[int]:
    excluded = set(exclude_ids or set())
    excluded.add(actor_id)

    ct = ContentType.objects.get_for_model(
        ForumSectionModel,
        for_concrete_model=False,
    )

    user_ids = set(
        SubscriptionModel.objects
        .filter(
            content_type=ct,
            object_id=section.id,
        )
        .exclude(user_id__in=excluded)
        .values_list("user_id", flat=True)
    )

    return list(
        exclude_blocked_user_ids(
            actor_id=actor_id,
            user_ids=user_ids,
        )
    )
