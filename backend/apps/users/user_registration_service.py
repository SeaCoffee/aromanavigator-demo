from __future__ import annotations

import logging
from copy import deepcopy

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction

from apps.users.models import ProfileModel, UserModel, UserStatsModel
from core.common_services.email_service import EmailService
from core.consent import user_terms_payload
from core.validators.user_validators import (
    build_registration_integrity_errors,
    validate_unique_display_name,
)


logger = logging.getLogger(__name__)


class UserRegistrationService:
    @staticmethod
    def _send_register_email_after_commit(user: UserModel) -> None:
        transaction.on_commit(
            lambda: UserRegistrationService._send_register_email(user)
        )

    @staticmethod
    def _ensure_registration_display_name_available(
        *,
        profile_data: dict,
        exclude_profile_id: int | None = None,
    ) -> None:
        display_name = profile_data.get("display_name")

        if not display_name:
            return

        try:
            profile_data["display_name"] = validate_unique_display_name(
                display_name,
                exclude_profile_id=exclude_profile_id,
            )
        except ValidationError as exc:
            raise ValidationError({"profile.display_name": exc.messages})

    @staticmethod
    def _refresh_pending_user(
        *,
        user: UserModel,
        data: dict,
        profile_data: dict,
        request=None,
    ) -> UserModel:
        if user.is_active or user.email_verified:
            raise ValidationError(
                {"email": ["A user with this email already exists."]}
            )

        try:
            exclude_profile_id = user.profile.id
        except ProfileModel.DoesNotExist:
            exclude_profile_id = None

        UserRegistrationService._ensure_registration_display_name_available(
            profile_data=profile_data,
            exclude_profile_id=exclude_profile_id,
        )

        user.set_password(data["password"])
        user.is_active = False
        user.email_verified = False

        for field, value in user_terms_payload(request).items():
            setattr(user, field, value)

        user.save(
            update_fields=[
                "password",
                "is_active",
                "email_verified",
                "terms_accepted_at",
                "terms_version",
                "privacy_version",
                "terms_acceptance_ip",
                "terms_acceptance_user_agent",
                "updated_at",
            ]
        )

        profile, _ = ProfileModel.objects.get_or_create(
            user=user,
            defaults={
                "name": profile_data["name"],
                "display_name": profile_data["display_name"],
                "region": profile_data.get(
                    "region",
                    ProfileModel._meta.get_field("region").default,
                ),
            },
        )

        for field in ("name", "display_name", "region"):
            if field in profile_data:
                setattr(profile, field, profile_data[field])

        profile.save(update_fields=["name", "display_name", "region", "updated_at"])
        user._state.fields_cache["profile"] = profile
        UserStatsModel.objects.get_or_create(user=user)

        UserRegistrationService._send_register_email_after_commit(user)

        return user

    @staticmethod
    @transaction.atomic
    def register(
        validated_data: dict,
        *,
        request=None,
    ) -> UserModel:
        data = deepcopy(validated_data)
        profile_data = data.pop("profile")
        data.pop("terms_accepted", None)
        email = data.get("email", "")

        existing_user = (
            UserModel.objects.select_for_update()
            .filter(email__iexact=email)
            .first()
        )

        if existing_user is not None:
            return UserRegistrationService._refresh_pending_user(
                user=existing_user,
                data=data,
                profile_data=profile_data,
                request=request,
            )

        try:
            UserRegistrationService._ensure_registration_display_name_available(
                profile_data=profile_data,
            )

            user = UserModel.objects.create_user(
                **data,
                **user_terms_payload(request),
            )

            ProfileModel.objects.create(
                user=user,
                **profile_data,
            )
            UserStatsModel.objects.create(user=user)

        except IntegrityError:
            raise ValidationError(
                build_registration_integrity_errors(
                    email=email,
                    profile_data=profile_data,
                )
            )

        UserRegistrationService._send_register_email_after_commit(user)

        return user

    @staticmethod
    def _send_register_email(user: UserModel) -> None:
        try:
            EmailService.register(user)
        except Exception:
            logger.exception(
                "Failed to send registration email for user_id=%s",
                user.id,
            )
