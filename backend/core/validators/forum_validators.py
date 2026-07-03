from __future__ import annotations

from django.core.exceptions import ValidationError


SECTION_TITLE_MAX_LENGTH = 120
SECTION_SLUG_MAX_LENGTH = 140
TOPIC_TITLE_MAX_LENGTH = 160
TOPIC_SLUG_MAX_LENGTH = 180


STAFF_ONLY_TOPIC_FIELDS = {
    "is_pinned",
    "is_locked",
    "is_hidden",
}


def clean_required_text(value: str, *, field_name: str, max_length: int | None = None) -> str:
    cleaned = str(value or "").strip()

    if not cleaned:
        raise ValidationError({field_name: ["РџРѕР»Рµ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё РїРѕСЂРѕР¶РЅС–Рј."]})

    if max_length is not None and len(cleaned) > max_length:
        raise ValidationError({
            field_name: [f"РњР°РєСЃРёРјСѓРј {max_length} СЃРёРјРІРѕР»С–РІ."]
        })

    return cleaned


def validate_section_title(value: str) -> str:
    return clean_required_text(
        value,
        field_name="title",
        max_length=SECTION_TITLE_MAX_LENGTH,
    )


def validate_topic_title(value: str) -> str:
    return clean_required_text(
        value,
        field_name="title",
        max_length=TOPIC_TITLE_MAX_LENGTH,
    )


def validate_topic_content(value: str) -> str:
    return clean_required_text(
        value,
        field_name="content",
    )


def validate_staff_only_topic_fields(*, user, raw_data: dict) -> None:
    is_staff = bool(
        user
        and getattr(user, "is_authenticated", False)
        and getattr(user, "is_staff", False)
    )

    if is_staff:
        return

    forbidden = [
        field
        for field in STAFF_ONLY_TOPIC_FIELDS
        if field in raw_data
    ]

    if forbidden:
        raise ValidationError({
            field: ["РќРµРґРѕСЃС‚Р°С‚РЅСЊРѕ РїСЂР°РІ РґР»СЏ Р·РјС–РЅРё С†СЊРѕРіРѕ РїРѕР»СЏ."]
            for field in forbidden
        })


def validate_topic_can_receive_comments(topic) -> None:
    if getattr(topic, "is_hidden", False):
        raise ValidationError("РўРµРјР° РїСЂРёС…РѕРІР°РЅР°.")

    if getattr(topic, "is_locked", False):
        raise ValidationError("РўРµРјР° Р·Р°РєСЂРёС‚Р° РґР»СЏ РєРѕРјРµРЅС‚Р°СЂС–РІ.")
