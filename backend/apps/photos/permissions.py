from __future__ import annotations

from rest_framework.permissions import BasePermission

from apps.users.permissions import is_staff_role_user


def photo_target_owner_id(obj):
    return (
        getattr(obj, "owner_id", None)
        or getattr(obj, "author_id", None)
        or getattr(obj, "user_id", None)
        or getattr(obj, "created_by_id", None)
    )


def can_manage_photo_target(obj, user) -> bool:
    if not user or not getattr(user, "is_authenticated", False):
        return False

    if is_staff_role_user(user):
        return True

    owner_id = photo_target_owner_id(obj)
    return owner_id is not None and int(owner_id) == int(user.id)


class CanManageStoredPhoto(BasePermission):
    message = "Permission denied."

    def has_object_permission(self, request, view, obj) -> bool:
        target = getattr(obj, "content_object", None)

        if target is None:
            return is_staff_role_user(request.user)

        return can_manage_photo_target(target, request.user)
