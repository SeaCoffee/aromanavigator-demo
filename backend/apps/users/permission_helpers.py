from django.contrib.auth.models import AnonymousUser

ADMIN_GROUP = "admin"
MODERATOR_GROUP = "moderator"


def is_authenticated_user(user) -> bool:
    return bool(user and not isinstance(user, AnonymousUser) and user.is_authenticated)


def is_superuser_user(user) -> bool:
    return is_authenticated_user(user) and bool(user.is_superuser)


def is_admin_user(user) -> bool:
    if not is_authenticated_user(user):
        return False
    return bool(user.is_superuser or user.groups.filter(name=ADMIN_GROUP).exists())


def is_forum_moderator_user(user) -> bool:
    if not is_authenticated_user(user):
        return False
    return bool(user.is_superuser or user.groups.filter(name=MODERATOR_GROUP).exists())


def is_staff_role_user(user) -> bool:
    if not is_authenticated_user(user):
        return False
    return bool(
        user.is_superuser
        or user.groups.filter(name__in=[ADMIN_GROUP, MODERATOR_GROUP]).exists()
    )
