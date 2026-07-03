# apps/activity/selectors.py

from django.db.models import Q, QuerySet

from apps.activity.models import ActivityEventModel
from apps.social.models import BlockModel, FollowModel


LEGACY_HIDDEN_ACTIVITY_VERBS = {
    "unliked",
}


def activity_base_queryset() -> QuerySet[ActivityEventModel]:
    return (
        ActivityEventModel.objects
        .exclude(verb__in=LEGACY_HIDDEN_ACTIVITY_VERBS)
        .filter(actor__is_active=True, actor__deleted_at__isnull=True)
        .select_related("actor", "actor__profile")
        .order_by("-created_at")
    )


def blocked_actor_ids_for_user(user) -> set[int]:
    if not user or not user.is_authenticated:
        return set()

    pairs = (
        BlockModel.objects
        .filter(Q(blocker=user) | Q(blocked=user))
        .values_list("blocker_id", "blocked_id")
    )

    return {
        user_id
        for pair in pairs
        for user_id in pair
        if user_id != user.id
    }


def followed_user_ids(user) -> set[int]:
    if not user or not user.is_authenticated:
        return set()

    return set(
        FollowModel.objects
        .filter(follower=user)
        .values_list("followee_id", flat=True)
    )


def feed_for(user) -> QuerySet[ActivityEventModel]:
    if not user or not user.is_authenticated:
        return public_feed()

    following_ids = followed_user_ids(user)
    blocked_ids = blocked_actor_ids_for_user(user)

    actor_ids = set(following_ids)
    actor_ids.add(user.id)
    actor_ids -= blocked_ids

    return (
        activity_base_queryset()
        .filter(
            Q(actor=user)
            |
            Q(actor_id__in=actor_ids, is_private=False)
        )
    )


def public_feed(viewer=None) -> QuerySet[ActivityEventModel]:
    queryset = activity_base_queryset().filter(is_private=False)
    blocked_ids = blocked_actor_ids_for_user(viewer)

    if blocked_ids:
        queryset = queryset.exclude(actor_id__in=blocked_ids)

    return queryset


def user_public_feed(user_id: int, viewer=None) -> QuerySet[ActivityEventModel]:
    if user_id in blocked_actor_ids_for_user(viewer):
        return ActivityEventModel.objects.none()

    return activity_base_queryset().filter(actor_id=user_id, is_private=False)


def target_public_feed(
    *,
    app: str,
    model: str,
    obj_id: int,
    viewer=None,
) -> QuerySet[ActivityEventModel]:
    queryset = (
        activity_base_queryset()
        .filter(
            target_app=app,
            target_model=model,
            target_id=obj_id,
            is_private=False,
        )
    )

    blocked_ids = blocked_actor_ids_for_user(viewer)

    if blocked_ids:
        queryset = queryset.exclude(actor_id__in=blocked_ids)

    return queryset
