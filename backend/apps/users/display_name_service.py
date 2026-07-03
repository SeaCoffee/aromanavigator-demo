from __future__ import annotations

import re

from django.core.exceptions import ValidationError

from apps.users.models import ProfileModel
from core.validators.profile_validators import (
    display_name_ci,
    validate_display_name,
)


_ALLOWED = re.compile(r"[^A-Za-z0-9._-]+")

DISPLAY_NAME_MAX = 30
DISPLAY_NAME_MIN = 3


def make_base_display_name(base: str | None) -> str:
    value = (base or "").strip()
    value = value.replace(" ", "")
    value = _ALLOWED.sub("", value)
    value = value.strip("._-")

    if not value:
        value = "user"

    value = value[:DISPLAY_NAME_MAX]

    if len(value) < DISPLAY_NAME_MIN:
        value = (value + "user")[:DISPLAY_NAME_MIN]

    try:
        return validate_display_name(value)
    except ValidationError:
        return "user"


def make_unique_display_name(base: str | None) -> str:
    root = make_base_display_name(base)

    if not ProfileModel.objects.filter(
        display_name_ci=display_name_ci(root),
    ).exists():
        return root

    for index in range(2, 500):
        suffix = f"-{index}"
        cut = DISPLAY_NAME_MAX - len(suffix)

        if cut < 1:
            raise RuntimeError("DISPLAY_NAME_MAX is too small for suffixing")

        candidate = root[:cut].rstrip("._-") + suffix
        candidate = validate_display_name(candidate)

        if not ProfileModel.objects.filter(
            display_name_ci=display_name_ci(candidate),
        ).exists():
            return candidate

    raise RuntimeError("Could not generate unique display_name")
