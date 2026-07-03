from apps.taste_profile.models import TasteProfileModel


def build_taste_profile_payload(profile: TasteProfileModel) -> dict:
    return {
        "item": {
            "app": profile._meta.app_label,
            "model": profile._meta.model_name,
            "id": profile.id,
            "user_id": profile.user_id,
            "is_public": profile.is_public,
        }
    }


def publish_taste_profile_created_activity(*, profile: TasteProfileModel) -> None:
    return None


def publish_taste_profile_updated_activity(*, profile: TasteProfileModel) -> None:
    return None
