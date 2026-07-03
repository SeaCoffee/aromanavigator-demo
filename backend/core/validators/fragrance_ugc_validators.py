from __future__ import annotations

import re
from urllib.parse import urlparse

from django.db.models import Q
from rest_framework import serializers

from apps.fragrance.models import (
    FragranceModel,
    FragranceNoteOfficialModel,
    NoteModel,
)
from apps.fragrance_ugc.models import (
    FragranceAddRequestModel,
    FragranceSimilaritySuggestionModel,
    FragranceSimilarityVoteModel,
    UserFragranceNoteSuggestionModel,
    UserFragranceNoteVoteModel,
)
from core.choises.status_choise import STATUS_CHOISE
from core.choises.note_level_choise import NOTE_LEVEL_CHOICES


TEXT_MAX_LENGTHS = {
    "brand_name": 255,
    "fragrance_name": 255,
    "perfumers_text": 500,
    "notes_text": 2000,
    "families_text": 500,
    "links_text": 2000,
    "moderator_comment": 500,
}

CONTROL_CHARS_RE = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]")


def _choice_values(choices) -> set[str]:
    values: set[str] = set()

    for item in choices:
        if isinstance(item, (tuple, list)) and item:
            values.add(str(item[0]))
        else:
            values.add(str(item))

    return values


NOTE_LEVEL_VALUES = _choice_values(NOTE_LEVEL_CHOICES)
MOD_STATUS_VALUES = {
    STATUS_CHOISE.PENDING,
    STATUS_CHOISE.APPROVED,
    STATUS_CHOISE.REJECTED,
}


def validate_clean_text_field(
    *,
    value,
    field: str,
    label: str,
    required: bool = False,
    max_length: int,
) -> str:
    clean = (value or "").strip()

    if required and not clean:
        raise serializers.ValidationError({field: f"{label} РѕР±РѕРІКјСЏР·РєРѕРІРµ РїРѕР»Рµ."})

    if not clean:
        return ""

    if CONTROL_CHARS_RE.search(clean):
        raise serializers.ValidationError(
            {field: f"{label} РјС–СЃС‚РёС‚СЊ РЅРµРґРѕРїСѓСЃС‚РёРјС– СЃРёРјРІРѕР»Рё."}
        )

    if len(clean) > max_length:
        raise serializers.ValidationError(
            {field: f"{label}: РјР°РєСЃРёРјСѓРј {max_length} СЃРёРјРІРѕР»С–РІ."}
        )

    return clean


def validate_links_text(value) -> str:
    clean = validate_clean_text_field(
        value=value,
        field="links_text",
        label="Р”Р¶РµСЂРµР»Р°",
        required=False,
        max_length=TEXT_MAX_LENGTHS["links_text"],
    )

    if not clean:
        return ""

    lines = [line.strip() for line in clean.splitlines() if line.strip()]

    for line in lines:
        parsed = urlparse(line)

        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise serializers.ValidationError(
                {
                    "links_text": (
                        "РљРѕР¶РЅРµ РґР¶РµСЂРµР»Рѕ РјР°С” Р±СѓС‚Рё РІР°Р»С–РґРЅРёРј РїРѕСЃРёР»Р°РЅРЅСЏРј "
                        "С– РїРѕС‡РёРЅР°С‚РёСЃСЏ Р· http:// Р°Р±Рѕ https://."
                    )
                }
            )

    return "\n".join(lines)


def validate_add_request_payload(payload: dict) -> dict:
    return {
        "brand_name": validate_clean_text_field(
            value=payload.get("brand_name"),
            field="brand_name",
            label="Р‘СЂРµРЅРґ",
            required=True,
            max_length=TEXT_MAX_LENGTHS["brand_name"],
        ),
        "fragrance_name": validate_clean_text_field(
            value=payload.get("fragrance_name"),
            field="fragrance_name",
            label="РќР°Р·РІР° Р°СЂРѕРјР°С‚Сѓ",
            required=True,
            max_length=TEXT_MAX_LENGTHS["fragrance_name"],
        ),
        "perfumers_text": validate_clean_text_field(
            value=payload.get("perfumers_text"),
            field="perfumers_text",
            label="РџР°СЂС„СѓРјРµСЂ(Рё)",
            required=False,
            max_length=TEXT_MAX_LENGTHS["perfumers_text"],
        ),
        "notes_text": validate_clean_text_field(
            value=payload.get("notes_text"),
            field="notes_text",
            label="РќРѕС‚Рё",
            required=False,
            max_length=TEXT_MAX_LENGTHS["notes_text"],
        ),
        "families_text": validate_clean_text_field(
            value=payload.get("families_text"),
            field="families_text",
            label="РЎС–РјРµР№СЃС‚РІР°",
            required=False,
            max_length=TEXT_MAX_LENGTHS["families_text"],
        ),
        "links_text": validate_links_text(payload.get("links_text")),
    }


def validate_vote_value(value: int) -> int:
    try:
        clean_value = int(value)
    except (TypeError, ValueError):
        raise serializers.ValidationError({"value": "value РјР°С” Р±СѓС‚Рё 1 Р°Р±Рѕ -1."})

    if clean_value not in (1, -1):
        raise serializers.ValidationError({"value": "value РјР°С” Р±СѓС‚Рё 1 Р°Р±Рѕ -1."})

    return clean_value


def validate_note_level(value: str) -> str:
    clean_level = (value or "").strip().lower()

    if clean_level not in NOTE_LEVEL_VALUES:
        raise serializers.ValidationError({"level": "РќРµРєРѕСЂРµРєС‚РЅРёР№ СЂС–РІРµРЅСЊ РЅРѕС‚Рё."})

    return clean_level


def validate_mod_status(value: str) -> str:
    clean_status = (value or "").strip().lower()

    if clean_status not in MOD_STATUS_VALUES:
        raise serializers.ValidationError({"status": "РќРµРєРѕСЂРµРєС‚РЅРёР№ СЃС‚Р°С‚СѓСЃ."})

    return clean_status


def validate_similarity_not_self(fragrance_id: int, similar_fragrance_id: int) -> None:
    try:
        left = int(fragrance_id)
        right = int(similar_fragrance_id)
    except (TypeError, ValueError):
        raise serializers.ValidationError(
            {"similar_fragrance_id": "РќРµРєРѕСЂРµРєС‚РЅРёР№ Р°СЂРѕРјР°С‚."}
        )

    if left == right:
        raise serializers.ValidationError(
            {"similar_fragrance_id": "РђСЂРѕРјР°С‚ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё СЃС…РѕР¶РёРј РЅР° СЃР°РјРѕРіРѕ СЃРµР±Рµ."}
        )


def validate_note_not_already_official(
    *,
    fragrance: FragranceModel,
    note: NoteModel,
    level: str,
) -> None:
    exists = FragranceNoteOfficialModel.objects.filter(
        fragrance=fragrance,
        note=note,
        level=level,
    ).exists()

    if exists:
        raise serializers.ValidationError(
            {"note_id": "Р¦СЏ РЅРѕС‚Р° РІР¶Рµ С” РІ РѕС„С–С†С–Р№РЅС–Р№ РїС–СЂР°РјС–РґС– Р°СЂРѕРјР°С‚Сѓ РЅР° С†СЊРѕРјСѓ СЂС–РІРЅС–."}
        )


def validate_note_suggestion_not_exists(
    *,
    fragrance: FragranceModel,
    note: NoteModel,
    user_id: int,
    level: str,
) -> None:
    exists = UserFragranceNoteSuggestionModel.objects.filter(
        fragrance=fragrance,
        note=note,
        created_by_id=user_id,
        level=level,
    ).exists()

    if exists:
        raise serializers.ValidationError(
            {"note_id": "Р’Рё РІР¶Рµ РїСЂРѕРїРѕРЅСѓРІР°Р»Рё С†СЋ РЅРѕС‚Сѓ РґР»СЏ С†СЊРѕРіРѕ СЂС–РІРЅСЏ."}
        )


def validate_note_suggestion_exists(
    suggestion_id: int,
) -> UserFragranceNoteSuggestionModel:
    suggestion = (
        UserFragranceNoteSuggestionModel.objects.select_for_update()
        .filter(id=suggestion_id)
        .first()
    )

    if not suggestion:
        raise serializers.ValidationError({"suggestion_id": "РџСЂРѕРїРѕР·РёС†С–СЋ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."})

    return suggestion


def validate_similarity_suggestion_not_exists(
    *,
    fragrance: FragranceModel,
    similar_fragrance: FragranceModel,
    user_id: int,
) -> None:
    exists = FragranceSimilaritySuggestionModel.objects.filter(
        Q(fragrance=fragrance, similar_fragrance=similar_fragrance)
        | Q(fragrance=similar_fragrance, similar_fragrance=fragrance),
        created_by_id=user_id,
    ).exists()

    if exists:
        raise serializers.ValidationError(
            {"similar_fragrance_id": "Р’Рё РІР¶Рµ РїСЂРѕРїРѕРЅСѓРІР°Р»Рё С†РµР№ СЃС…РѕР¶РёР№ Р°СЂРѕРјР°С‚."}
        )


def validate_similarity_suggestion_exists(
    suggestion_id: int,
) -> FragranceSimilaritySuggestionModel:
    suggestion = (
        FragranceSimilaritySuggestionModel.objects.select_for_update()
        .filter(id=suggestion_id)
        .first()
    )

    if not suggestion:
        raise serializers.ValidationError({"suggestion_id": "РџСЂРѕРїРѕР·РёС†С–СЋ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."})

    return suggestion


def validate_suggestion_can_be_voted(status: str) -> None:
    if status == STATUS_CHOISE.REJECTED:
        raise serializers.ValidationError(
            {"status": "Р—Р° РІС–РґС…РёР»РµРЅСѓ РїСЂРѕРїРѕР·РёС†С–СЋ РЅРµ РјРѕР¶РЅР° РіРѕР»РѕСЃСѓРІР°С‚Рё."}
        )


def validate_user_is_not_author(*, user_id: int, created_by_id: int) -> None:
    if int(user_id) == int(created_by_id):
        raise serializers.ValidationError(
            {"detail": "РќРµ РјРѕР¶РЅР° РіРѕР»РѕСЃСѓРІР°С‚Рё Р·Р° РІР»Р°СЃРЅСѓ РїСЂРѕРїРѕР·РёС†С–СЋ."}
        )


def validate_note_vote_not_same(
    vote: UserFragranceNoteVoteModel,
    value: int,
) -> None:
    if vote.value == value:
        raise serializers.ValidationError({"value": "Р’Рё РІР¶Рµ РіРѕР»РѕСЃСѓРІР°Р»Рё С‚Р°Рє СЃР°РјРѕ."})


def validate_similarity_vote_not_same(
    vote: FragranceSimilarityVoteModel,
    value: int,
) -> None:
    if vote.value == value:
        raise serializers.ValidationError({"value": "Р’Рё РІР¶Рµ РіРѕР»РѕСЃСѓРІР°Р»Рё С‚Р°Рє СЃР°РјРѕ."})


def validate_add_request_names(
    *,
    brand_name: str,
    fragrance_name: str,
) -> tuple[str, str]:
    clean_brand = validate_clean_text_field(
        value=brand_name,
        field="brand_name",
        label="Р‘СЂРµРЅРґ",
        required=True,
        max_length=TEXT_MAX_LENGTHS["brand_name"],
    )

    clean_fragrance = validate_clean_text_field(
        value=fragrance_name,
        field="fragrance_name",
        label="РќР°Р·РІР° Р°СЂРѕРјР°С‚Сѓ",
        required=True,
        max_length=TEXT_MAX_LENGTHS["fragrance_name"],
    )

    return clean_brand, clean_fragrance


def validate_add_request_exists(request_id: int) -> FragranceAddRequestModel:
    req = (
        FragranceAddRequestModel.objects.select_for_update()
        .filter(id=request_id)
        .first()
    )

    if not req:
        raise serializers.ValidationError({"id": "Р—Р°СЏРІРєСѓ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."})

    return req

def validate_add_request_staff_update_payload(payload: dict) -> dict:
    clean_payload: dict = {}

    if "brand_name" in payload:
        clean_payload["brand_name"] = validate_clean_text_field(
            value=payload.get("brand_name"),
            field="brand_name",
            label="Р‘СЂРµРЅРґ",
            required=True,
            max_length=TEXT_MAX_LENGTHS["brand_name"],
        )

    if "fragrance_name" in payload:
        clean_payload["fragrance_name"] = validate_clean_text_field(
            value=payload.get("fragrance_name"),
            field="fragrance_name",
            label="РќР°Р·РІР° Р°СЂРѕРјР°С‚Сѓ",
            required=True,
            max_length=TEXT_MAX_LENGTHS["fragrance_name"],
        )

    if "perfumers_text" in payload:
        clean_payload["perfumers_text"] = validate_clean_text_field(
            value=payload.get("perfumers_text"),
            field="perfumers_text",
            label="РџР°СЂС„СѓРјРµСЂ(Рё)",
            required=False,
            max_length=TEXT_MAX_LENGTHS["perfumers_text"],
        )

    if "notes_text" in payload:
        clean_payload["notes_text"] = validate_clean_text_field(
            value=payload.get("notes_text"),
            field="notes_text",
            label="РќРѕС‚Рё",
            required=False,
            max_length=TEXT_MAX_LENGTHS["notes_text"],
        )

    if "families_text" in payload:
        clean_payload["families_text"] = validate_clean_text_field(
            value=payload.get("families_text"),
            field="families_text",
            label="РЎС–РјРµР№СЃС‚РІР°",
            required=False,
            max_length=TEXT_MAX_LENGTHS["families_text"],
        )

    if "links_text" in payload:
        clean_payload["links_text"] = validate_links_text(payload.get("links_text"))

    if "moderator_comment" in payload:
        clean_payload["moderator_comment"] = validate_clean_text_field(
            value=payload.get("moderator_comment"),
            field="moderator_comment",
            label="РљРѕРјРµРЅС‚Р°СЂ РјРѕРґРµСЂР°С‚РѕСЂР°",
            required=False,
            max_length=TEXT_MAX_LENGTHS["moderator_comment"],
        )

    return clean_payload
