from __future__ import annotations

import re

from django.core.exceptions import ValidationError


TAG_CODE_MIN_LENGTH = 2
TAG_CODE_MAX_LENGTH = 32
MAX_TAGS_PER_OBJECT = 20

TAG_CODE_RE = re.compile(r"^\w{2,32}$", flags=re.UNICODE)
TAG_RE = re.compile(r"(?<!\w)#(\w{2,32})", flags=re.UNICODE)


def normalize_tag_code(value: str) -> str:
    return str(value or "").strip().lstrip("#").casefold()


def validate_tag_code(value: str) -> None:
    code = normalize_tag_code(value)

    if not code:
        raise ValidationError("Tag code is required.")

    if len(code) < TAG_CODE_MIN_LENGTH:
        raise ValidationError(f"Tag code must be at least {TAG_CODE_MIN_LENGTH} characters.")

    if len(code) > TAG_CODE_MAX_LENGTH:
        raise ValidationError(f"Tag code must be at most {TAG_CODE_MAX_LENGTH} characters.")

    if not TAG_CODE_RE.fullmatch(code):
        raise ValidationError(
            "Tag code may contain only letters, numbers and underscore."
        )
