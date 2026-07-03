from __future__ import annotations

from typing import Tuple

from django.core.exceptions import PermissionDenied, ValidationError
from django.db import IntegrityError
from django.db.transaction import atomic

from apps.auth.exceptions.auth_social_exception import (
    ProviderAuthError,
    ProviderConfigError,
    SocialProviderConfigError,
)
from apps.auth.providers.google_provider import verify_google_id_token
from apps.users.display_name_service import make_unique_display_name
from apps.users.models import (
    ProfileModel,
    SocialAccountModel,
    UserModel,
    UserStatsModel,
)
from core.choises.social_providers_choise import SocialProvider


def _normalize_email(email: str | None) -> str:
    value = (email or "").strip()

    if not value:
        return ""

    return UserModel.objects.normalize_email(value)


def _safe_social_display_base(user: UserModel, name: str | None) -> str:
    clean_name = (name or "").strip()

    if clean_name and "@" not in clean_name:
        return clean_name

    return f"user{user.pk}"


def _ensure_profile(
    user: UserModel,
    *,
    name: str | None,
    display_base: str | None,
) -> ProfileModel:
    try:
        return user.profile
    except ProfileModel.DoesNotExist:
        pass

    safe_name = (name or "").strip()[:25] or "User"

    for _ in range(10):
        display_name = make_unique_display_name(display_base)

        try:
            return ProfileModel.objects.create(
                user=user,
                name=safe_name,
                display_name=display_name,
            )
        except IntegrityError:
            try:
                return user.profile
            except ProfileModel.DoesNotExist:
                continue

    raise RuntimeError("Could not create profile / generate unique display_name")


def _ensure_stats(user: UserModel) -> UserStatsModel:
    stats, _ = UserStatsModel.objects.get_or_create(user=user)

    return stats


def _ensure_user_side_records(
    user: UserModel,
    *,
    name: str | None,
    display_base: str | None,
) -> None:
    _ensure_profile(
        user,
        name=name,
        display_base=display_base,
    )
    _ensure_stats(user)


def _assert_google_email_is_usable(
    *,
    email: str,
    email_verified: bool,
) -> None:
    if not email:
        raise PermissionDenied("Google РЅРµ РЅР°РґР°РІ РµР»РµРєС‚СЂРѕРЅРЅСѓ РїРѕС€С‚Сѓ.")

    if not email_verified:
        raise PermissionDenied("Р•Р»РµРєС‚СЂРѕРЅРЅР° РїРѕС€С‚Р° РІ Google РЅРµ РїС–РґС‚РІРµСЂРґР¶РµРЅР°.")


def _assert_can_login_existing_social_user(
    user: UserModel,
    *,
    email_verified: bool,
) -> None:
    if user.is_active:
        return

    if email_verified:
        user.is_active = True
        update_fields = ["is_active", "updated_at"]

        if not user.email_verified:
            user.email_verified = True
            update_fields.append("email_verified")

        user.save(update_fields=update_fields)
        return

    raise PermissionDenied("РћР±Р»С–РєРѕРІРёР№ Р·Р°РїРёСЃ РЅРµ Р°РєС‚РёРІРѕРІР°РЅРѕ. РџС–РґС‚РІРµСЂРґСЊС‚Рµ РµР»РµРєС‚СЂРѕРЅРЅСѓ РїРѕС€С‚Сѓ.")


def _mark_google_email_verified_if_needed(
    user: UserModel,
    *,
    email_verified: bool,
) -> None:
    if not email_verified:
        return

    if user.email_verified:
        return

    user.email_verified = True
    user.save(update_fields=["email_verified", "updated_at"])


def _get_google_payload(id_token: str) -> dict:
    try:
        social_data = verify_google_id_token(id_token)
    except ProviderAuthError as exc:
        raise ValidationError({"id_token": [str(exc)]})
    except ProviderConfigError as exc:
        raise SocialProviderConfigError(str(exc))

    if not social_data.get("provider_user_id"):
        raise ValidationError({"id_token": ["Google РЅРµ РїРѕРІРµСЂРЅСѓРІ С–РґРµРЅС‚РёС„С–РєР°С‚РѕСЂ РєРѕСЂРёСЃС‚СѓРІР°С‡Р°."]})

    return social_data


@atomic
def get_or_create_user_from_google(
    *,
    provider_user_id: str,
    email: str | None,
    name: str | None,
    email_verified: bool = False,
    request=None,
) -> Tuple[UserModel, bool]:
    normalized_email = _normalize_email(email)

    social_account = (
        SocialAccountModel.objects
        .select_related("user", "user__profile", "user__stats")
        .filter(
            provider=SocialProvider.GOOGLE,
            provider_user_id=provider_user_id,
        )
        .first()
    )

    if social_account is not None:
        user = social_account.user

        _assert_can_login_existing_social_user(
            user,
            email_verified=email_verified,
        )
        _ensure_user_side_records(
            user,
            name=name,
            display_base=_safe_social_display_base(user, name),
        )
        _mark_google_email_verified_if_needed(
            user,
            email_verified=email_verified,
        )

        return user, False

    _assert_google_email_is_usable(
        email=normalized_email,
        email_verified=email_verified,
    )

    user = UserModel.objects.filter(email__iexact=normalized_email).first()
    created_user = False

    if user is None:
        try:
            user = UserModel.objects.create_user(
                email=normalized_email,
                password=None,
                is_active=True,
                email_verified=True,
            )
            created_user = True
        except IntegrityError:
            user = UserModel.objects.filter(email__iexact=normalized_email).first()

            if user is None:
                raise
    if not user.is_active:
        user.is_active = True
        user.email_verified = True
        user.save(update_fields=["is_active", "email_verified", "updated_at"])
    elif not user.email_verified:
        user.email_verified = True
        user.save(update_fields=["email_verified", "updated_at"])

    _ensure_user_side_records(
        user,
        name=name,
        display_base=_safe_social_display_base(user, name),
    )

    social_account, created_social = SocialAccountModel.objects.get_or_create(
        provider=SocialProvider.GOOGLE,
        provider_user_id=provider_user_id,
        defaults={
            "user": user,
            "email": normalized_email,
        },
    )

    if not created_social and social_account.user_id != user.id:
        user = social_account.user

        _assert_can_login_existing_social_user(
            user,
            email_verified=email_verified,
        )
        _ensure_user_side_records(
            user,
            name=name,
            display_base=_safe_social_display_base(user, name),
        )
        _mark_google_email_verified_if_needed(
            user,
            email_verified=email_verified,
        )

        return user, False

    return user, created_user or created_social


class GoogleAuthService:
    @staticmethod
    def login_with_id_token(
        id_token: str,
        *,
        request=None,
    ) -> tuple[UserModel, bool]:
        social_data = _get_google_payload(id_token)

        return get_or_create_user_from_google(
            provider_user_id=social_data["provider_user_id"],
            email=social_data.get("email"),
            name=social_data.get("name"),
            email_verified=social_data.get("email_verified", False),
            request=request,
        )
