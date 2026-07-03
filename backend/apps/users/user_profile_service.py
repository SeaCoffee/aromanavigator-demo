from __future__ import annotations

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction

from apps.users.models import ProfileModel
from core.validators.user_validators import validate_profile_update_payload


PROFILE_UPDATE_FIELDS = {
    "name",
    "display_name",
    "region",
    "about_me",
}


class UserProfileService:
    @staticmethod
    @transaction.atomic
    def update_profile(
        *,
        user,
        profile_data: dict,
    ):
        profile = (
            ProfileModel.objects
            .select_for_update()
            .get(user=user)
        )

        clean_data = {
            key: value
            for key, value in profile_data.items()
            if key in PROFILE_UPDATE_FIELDS
        }

        try:
            clean_data = validate_profile_update_payload(
                profile=profile,
                data=clean_data,
            )

            if not clean_data:
                return user

            for field, value in clean_data.items():
                setattr(profile, field, value)

            update_fields = list(clean_data.keys())

            if "display_name" in clean_data:
                update_fields.append("display_name_ci")

            update_fields.append("updated_at")
            profile.save(update_fields=update_fields)

        except IntegrityError:
            raise ValidationError(
                {
                    "display_name": ["This display name is already taken."]
                }
            )

        return user
