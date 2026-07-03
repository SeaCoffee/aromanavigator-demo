from __future__ import annotations

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from apps.users.models import ProfileModel
from core.choises.region_choise import RegionChoices
from core.validators.profile_validators import (
    display_name_ci,
    validate_display_name,
)


UserModel = get_user_model()


def normalize_user_email(value: str) -> str:
    email = (value or "").strip()
    return UserModel.objects.normalize_email(email)


def validate_unique_user_email(
    value: str,
    *,
    exclude_user_id: int | None = None,
    allow_unverified_pending: bool = False,
) -> str:
    email = normalize_user_email(value)

    qs = UserModel.objects.filter(email__iexact=email)

    if exclude_user_id is not None:
        qs = qs.exclude(pk=exclude_user_id)

    existing = qs.first()

    if existing and (
        not allow_unverified_pending
        or existing.is_active
        or existing.email_verified
    ):
        raise ValidationError("A user with this email already exists.")

    return email


def validate_unique_display_name(
    value: str,
    *,
    exclude_profile_id: int | None = None,
) -> str:
    display_name = validate_display_name(value)
    normalized_ci = display_name_ci(display_name)

    qs = ProfileModel.objects.filter(display_name_ci=normalized_ci)

    if exclude_profile_id is not None:
        qs = qs.exclude(pk=exclude_profile_id)

    if qs.exists():
        raise ValidationError("This display name is already taken.")

    return display_name


def validate_profile_region(value: str) -> str:
    region = (value or "").strip()

    if region not in RegionChoices.values:
        raise ValidationError("Invalid region.")

    return region


def validate_profile_update_payload(
    *,
    profile: ProfileModel,
    data: dict,
) -> dict:
    errors = {}

    if "display_name" in data:
        try:
            data["display_name"] = validate_unique_display_name(
                data["display_name"],
                exclude_profile_id=profile.id,
            )
        except ValidationError as exc:
            errors["display_name"] = exc.messages

    if "region" in data:
        try:
            data["region"] = validate_profile_region(data["region"])
        except ValidationError as exc:
            errors["region"] = exc.messages

    if errors:
        raise ValidationError(errors)

    return data


def build_registration_integrity_errors(
    *,
    email: str | None,
    profile_data: dict,
) -> dict:
    errors: dict = {}

    if email and UserModel.objects.filter(email__iexact=email).exists():
        errors["email"] = ["A user with this email already exists."]

    display_name = profile_data.get("display_name")

    if display_name:
        normalized_ci = display_name_ci(display_name)

        if ProfileModel.objects.filter(display_name_ci=normalized_ci).exists():
            errors["profile.display_name"] = ["This display name is already taken."]

    if not errors:
        errors["detail"] = "Email or display name already exists."

    return errors
