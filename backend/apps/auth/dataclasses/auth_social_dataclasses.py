from dataclasses import dataclass, field
from typing import List

from django.conf import settings


def _get_google_client_ids() -> List[str]:
    value = getattr(settings, "GOOGLE_CLIENT_IDS", None)

    if isinstance(value, (list, tuple)):
        return [str(item).strip() for item in value if str(item).strip()]

    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]

    return []


@dataclass(frozen=True)
class SocialAuthConfig:
    GOOGLE_CLIENT_ID: str = getattr(settings, "GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_IDS: List[str] = field(default_factory=_get_google_client_ids)


SOCIAL_AUTH = SocialAuthConfig()
