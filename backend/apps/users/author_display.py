from __future__ import annotations

from django.conf import settings

from apps.users.avatar_selectors import profile_avatar_url


DEFAULT_STAFF_USERNAME = "admin"
DEFAULT_STAFF_DISPLAY_NAME = "РђРґРјС–РЅС–СЃС‚СЂР°С†С–СЏ"
DEFAULT_STAFF_ROLE_LABEL = "РњРѕРґРµСЂР°С†С–СЏ"
DEFAULT_PUBLIC_USER_DISPLAY_NAME = "РљРѕСЂРёСЃС‚СѓРІР°С‡"
DELETED_USER_DISPLAY_NAME = "Р’РёРґР°Р»РµРЅРёР№ РєРѕСЂРёСЃС‚СѓРІР°С‡"


def is_deleted_user(user) -> bool:
    return bool(user and getattr(user, "deleted_at", None))


def is_staff_public_author(user) -> bool:
    # Staff accounts are ordinary public authors unless a concrete object is
    # explicitly marked as official (comments/messages use their own flag).
    return False


def staff_public_username() -> str:
    return getattr(settings, "PUBLIC_STAFF_USERNAME", DEFAULT_STAFF_USERNAME)


def staff_public_display_name() -> str:
    return getattr(
        settings,
        "PUBLIC_STAFF_DISPLAY_NAME",
        DEFAULT_STAFF_DISPLAY_NAME,
    )


def staff_public_role_label() -> str:
    return getattr(
        settings,
        "PUBLIC_STAFF_ROLE_LABEL",
        DEFAULT_STAFF_ROLE_LABEL,
    )


def public_user_username(user) -> str | None:
    if not user:
        return None
    if is_deleted_user(user):
        return None

    profile = getattr(user, "profile", None)
    display_name = getattr(profile, "display_name", None) if profile else None

    if display_name:
        return display_name

    return None


def public_user_display_name(user) -> str | None:
    if not user:
        return None
    if is_deleted_user(user):
        return DELETED_USER_DISPLAY_NAME

    profile = getattr(user, "profile", None)

    if profile:
        display_name = getattr(profile, "display_name", None)
        if display_name:
            return display_name

        name = getattr(profile, "name", None)
        if name:
            return name

    first_name = getattr(user, "first_name", "") or ""
    last_name = getattr(user, "last_name", "") or ""
    full_name = f"{first_name} {last_name}".strip()

    if full_name:
        return full_name

    return DEFAULT_PUBLIC_USER_DISPLAY_NAME


def personal_user_display_name(user) -> str | None:
    if not user:
        return None
    if is_deleted_user(user):
        return DELETED_USER_DISPLAY_NAME

    profile = getattr(user, "profile", None)
    if profile:
        return (
            getattr(profile, "display_name", None)
            or getattr(profile, "name", None)
            or DEFAULT_PUBLIC_USER_DISPLAY_NAME
        )

    full_name = f"{getattr(user, 'first_name', '') or ''} {getattr(user, 'last_name', '') or ''}".strip()
    return full_name or DEFAULT_PUBLIC_USER_DISPLAY_NAME


def personal_user_username(user) -> str | None:
    if not user:
        return None
    if is_deleted_user(user):
        return None
    profile = getattr(user, "profile", None)
    return getattr(profile, "display_name", None) if profile else None


def personal_user_avatar(user) -> str | None:
    if not user:
        return None
    if is_deleted_user(user):
        return None
    profile = getattr(user, "profile", None)
    return profile_avatar_url(profile) if profile else None


def public_user_avatar(user, request=None) -> str | None:
    if not user:
        return None
    if is_deleted_user(user):
        return None

    profile = getattr(user, "profile", None)
    if not profile:
        return None

    return profile_avatar_url(profile)


def public_user_role_label(user) -> str | None:
    return None
