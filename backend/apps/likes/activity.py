from __future__ import annotations


def get_target_owner_id(target) -> int | None:
    if target is None:
        return None

    return (
        getattr(target, "author_id", None)
        or getattr(target, "owner_id", None)
        or getattr(target, "user_id", None)
    )


def get_external_owner_id(*, actor_id: int, target) -> int | None:
    owner_id = get_target_owner_id(target)

    if not owner_id or owner_id == actor_id:
        return None

    return owner_id


def publish_like_activity(*, actor, target, like_id: int) -> None:
    return None
