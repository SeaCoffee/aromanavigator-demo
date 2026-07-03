# core/utils/target_owner.py

def get_target_owner_id(target) -> int | None:
    return (
        getattr(target, "owner_id", None)
        or getattr(target, "author_id", None)
        or getattr(target, "user_id", None)
    )
