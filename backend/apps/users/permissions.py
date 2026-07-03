from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission, SAFE_METHODS, IsAuthenticated
from django.utils import timezone

from apps.users.admin_suspension_service import AdminSuspensionService
from apps.users.user_role_service import UserRoleService


def is_authenticated_user(user) -> bool:
    return bool(user and user.is_authenticated)


def is_superuser_user(user) -> bool:
    return is_authenticated_user(user) and bool(user.is_superuser)


def is_admin_user(user) -> bool:
    return is_authenticated_user(user) and UserRoleService.is_admin(user)


def is_forum_moderator_user(user) -> bool:
    return is_authenticated_user(user) and UserRoleService.is_moderator(user)


def is_staff_role_user(user) -> bool:
    return is_authenticated_user(user) and UserRoleService.is_staff_role(user)


class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return is_superuser_user(request.user)


class IsSuperuser(BasePermission):
    def has_permission(self, request, view):
        return is_superuser_user(request.user)


class IsAdminOrSuperuser(BasePermission):
    def has_permission(self, request, view):
        return is_admin_user(request.user)


class IsSuperuserOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return is_admin_user(request.user)


class IsForumModeratorOrSuperuser(BasePermission):
    def has_permission(self, request, view):
        return is_forum_moderator_user(request.user)


class IsStaffRole(BasePermission):
    def has_permission(self, request, view):
        return is_staff_role_user(request.user)


class IsSeller(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(is_authenticated_user(u) and getattr(u, "is_seller", False))


class IsPremiumSeller(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(
            is_authenticated_user(u)
            and getattr(u, "is_seller", False)
            and getattr(u, "account_type", "") == "premium"
        )


class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return getattr(obj, "user_id", None) == request.user.id


class IsModeratorOrStaff(BasePermission):
    required_perm = "users.can_review_conversations"

    def has_permission(self, request, view):
        u = request.user

        if not is_authenticated_user(u):
            return False

        return u.has_perm(self.required_perm) or is_staff_role_user(u)


class IsNotSuspended(BasePermission):
    message = "РћР±Р»С–РєРѕРІРёР№ Р·Р°РїРёСЃ С‚РёРјС‡Р°СЃРѕРІРѕ Р·Р°Р±Р»РѕРєРѕРІР°РЅРёР№."

    def has_permission(self, request, view) -> bool:
        u = getattr(request, "user", None)

        if not is_authenticated_user(u):
            return True

        if getattr(u, "suspended_indefinitely", False):
            raise PermissionDenied(
                detail={
                    "detail": self.message,
                    "suspended_until": None,
                    "suspended_indefinitely": True,
                    "seconds_left": None,
                }
            )

        if u.suspended_until and u.suspended_until <= timezone.now():
            try:
                AdminSuspensionService.cleanup_expired(u)
            except Exception:
                pass
            return True

        if u.suspended_until and u.suspended_until > timezone.now():
            raise PermissionDenied(
                detail={
                    "detail": self.message,
                    "suspended_until": u.suspended_until,
                    "suspended_indefinitely": False,
                    "seconds_left": u.suspension_seconds_left,
                }
            )

        return True


class IsAuthenticatedAndCleanup(IsAuthenticated):
    def has_permission(self, request, view):
        ok = super().has_permission(request, view)

        if not ok:
            return False

        try:
            AdminSuspensionService.cleanup_expired(request.user)
        except Exception:
            pass

        return True


class IsNotSuspendedOrReadOnly(IsNotSuspended):
    def has_permission(self, request, view) -> bool:
        if request.method in SAFE_METHODS:
            return True

        return super().has_permission(request, view)


class IsOwnerOrStaff(BasePermission):
    message = "You do not have permission to modify this object."

    def has_object_permission(self, request, view, obj):
        u = getattr(request, "user", None)

        if not is_authenticated_user(u):
            return False

        if is_staff_role_user(u):
            return True

        owner_id = (
            getattr(obj, "author_id", None)
            or getattr(obj, "user_id", None)
        )

        return owner_id == u.id

class IsCommentOwnerOrStaff(BasePermission):
    def has_object_permission(self, request, view, obj) -> bool:
        if request.method in SAFE_METHODS:
            return True

        user = getattr(request, "user", None)

        if not is_authenticated_user(user):
            return False

        if is_staff_role_user(user):
            return True

        return getattr(obj, "user_id", None) == user.id
