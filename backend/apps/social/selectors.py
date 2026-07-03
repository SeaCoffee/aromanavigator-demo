from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db.models import Q

from apps.social.models import BlockModel, FollowModel, SubscriptionModel


User = get_user_model()


def blocked_relation_exists(*, actor, target) -> bool:
    if not actor or not target or not getattr(actor, "is_authenticated", False):
        return False

    return BlockModel.objects.relation_between(
        actor=actor,
        target=target,
    ).exists()


def is_following(*, actor, target) -> bool:
    if not actor or not target or not getattr(actor, "is_authenticated", False):
        return False

    if actor.pk == target.pk:
        return False

    return FollowModel.objects.by_pair(
        follower=actor,
        followee=target,
    ).exists()


def is_blocked_by_me(*, actor, target) -> bool:
    if not actor or not target or not getattr(actor, "is_authenticated", False):
        return False

    if actor.pk == target.pk:
        return False

    return BlockModel.objects.by_pair(
        blocker=actor,
        blocked=target,
    ).exists()


def followers_for_user(user_id: int):
    """
    РџРѕР»СЊР·РѕРІР°С‚РµР»Рё, РєРѕС‚РѕСЂС‹Рµ РїРѕРґРїРёСЃР°РЅС‹ РЅР° user_id.
    """
    follower_ids = (
        FollowModel.objects
        .filter(followee_id=user_id)
        .values("follower_id")
    )

    return (
        User.objects
        .filter(id__in=follower_ids, is_active=True)
        .select_related("profile", "stats")
        .order_by("profile__display_name", "id")
    )


def following_for_user(user_id: int):
    """
    РџРѕР»СЊР·РѕРІР°С‚РµР»Рё, РЅР° РєРѕС‚РѕСЂС‹С… РїРѕРґРїРёСЃР°РЅ user_id.
    """
    followee_ids = (
        FollowModel.objects
        .filter(follower_id=user_id)
        .values("followee_id")
    )

    return (
        User.objects
        .filter(id__in=followee_ids, is_active=True)
        .select_related("profile", "stats")
        .order_by("profile__display_name", "id")
    )


def exclude_blocked_for_viewer(qs, viewer):
    """
    РЎРєСЂС‹РІР°РµРј РёР· СЃРїРёСЃРєР° РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№, РµСЃР»Рё:
    - viewer Р·Р°Р±Р»РѕРєРёСЂРѕРІР°Р» СЌС‚РѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ;
    - СЌС‚РѕС‚ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ Р·Р°Р±Р»РѕРєРёСЂРѕРІР°Р» viewer.
    """
    if not viewer or not getattr(viewer, "is_authenticated", False):
        return qs

    hidden_user_ids = BlockModel.objects.filter(
        Q(blocker=viewer) | Q(blocked=viewer)
    ).values_list(
        "blocked_id",
        "blocker_id",
    )

    ids_to_exclude: set[int] = set()

    for blocked_id, blocker_id in hidden_user_ids:
        if blocker_id == viewer.id:
            ids_to_exclude.add(blocked_id)

        if blocked_id == viewer.id:
            ids_to_exclude.add(blocker_id)

    if not ids_to_exclude:
        return qs

    return qs.exclude(id__in=ids_to_exclude)


def social_state_for_user(*, actor, target) -> dict:
    if not actor or not target or not getattr(actor, "is_authenticated", False):
        return {
            "is_following": False,
            "is_blocked_by_me": False,
            "is_blocked_between": False,
        }

    if actor.pk == target.pk:
        return {
            "is_following": False,
            "is_blocked_by_me": False,
            "is_blocked_between": False,
        }

    return {
        "is_following": is_following(actor=actor, target=target),
        "is_blocked_by_me": is_blocked_by_me(actor=actor, target=target),
        "is_blocked_between": blocked_relation_exists(actor=actor, target=target),
    }


def subscriptions_for_user(user):
    return (
        SubscriptionModel.objects
        .for_user(user)
        .ordered_newest()
    )


def filtered_subscriptions_for_user(*, user, filters: dict):
    qs = subscriptions_for_user(user)

    app = filters.get("app")
    model = filters.get("model")
    object_id = filters.get("id")

    if not app or not model or not object_id:
        return qs

    return qs.for_target_reference(
        app=app,
        model=model,
        object_id=object_id,
    )
