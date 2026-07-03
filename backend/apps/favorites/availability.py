from __future__ import annotations

from apps.social.selectors import blocked_relation_exists
from core.utils.target_owner import get_target_owner_id


def is_hidden_target_for_user(target, user) -> bool:
    status = getattr(target, "status", None)

    if not status:
        return False

    owner_id = get_target_owner_id(target)

    if owner_id and user and user.is_authenticated and owner_id == user.id:
        return False

    moderation_status = getattr(target, "moderation_status", None)
    return status != "active" or moderation_status != "approved"


def is_blocked_target_for_user(target, user) -> bool:
    owner_id = get_target_owner_id(target)

    if not owner_id or not user or not user.is_authenticated:
        return False

    if owner_id == user.id:
        return False

    User = user.__class__

    try:
        owner = User.objects.filter(id=owner_id).first()
    except Exception:
        return False

    if owner is None:
        return False

    return blocked_relation_exists(actor=user, target=owner)


def get_favorite_unavailable_reason(target, user) -> str | None:
    if is_blocked_target_for_user(target, user):
        return "blocked"

    if is_hidden_target_for_user(target, user):
        return "hidden"

    return None
