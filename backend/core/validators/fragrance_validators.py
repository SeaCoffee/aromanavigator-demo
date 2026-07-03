from __future__ import annotations

from django.utils import timezone
import re
from datetime import date

from rest_framework import serializers

from apps.fragrance.models import (
    BrandModel,
    PerfumerModel,
    NoteModel,
    OlfactoryFamilyModel,
    FragranceModel,
    FragranceNoteOfficialModel,
)
from core.choises.note_level_choise import NOTE_LEVEL_CHOICES


RELEASE_YEAR_MIN = 1500
RELEASE_YEAR_MAX = date.today().year + 1
RELEASE_YEAR_RE = re.compile(r"^\d{4}$")


def _choice_values(choices) -> set[str]:
    values: set[str] = set()

    for item in choices:
        if isinstance(item, (list, tuple)) and item:
            values.add(str(item[0]))
        else:
            values.add(str(item))

    return values


NOTE_LEVEL_VALUES = _choice_values(NOTE_LEVEL_CHOICES)


def clean_required_name(
    *,
    value: str,
    empty_msg: str,
    max_len: int = 255,
) -> str:
    clean_value = (value or "").strip()

    if not clean_value:
        raise serializers.ValidationError(empty_msg)

    if len(clean_value) > max_len:
        raise serializers.ValidationError(f"РњР°РєСЃРёРјСѓРј {max_len} СЃРёРјРІРѕР»С–РІ.")

    return clean_value


def validate_unique_dictionary_name(
    *,
    model_cls,
    value: str,
    empty_msg: str,
    duplicate_msg: str,
    max_len: int = 255,
) -> str:
    clean_value = clean_required_name(
        value=value,
        empty_msg=empty_msg,
        max_len=max_len,
    )

    if model_cls.objects.filter(name__iexact=clean_value).exists():
        raise serializers.ValidationError(duplicate_msg)

    return clean_value


def validate_required_name(
    *,
    value: str,
    field_name: str,
    empty_msg: str,
    max_len: int = 255,
) -> str:
    try:
        return clean_required_name(
            value=value,
            empty_msg=empty_msg,
            max_len=max_len,
        )
    except serializers.ValidationError as exc:
        raise serializers.ValidationError({field_name: exc.detail})






def validate_release_year(value):
    """
    РџСЂРѕРїСѓСЃРєР°РµРј С‚РѕР»СЊРєРѕ:
    - None
    - ""
    - СЃС‚СЂРѕРєСѓ РёР· 4 С†РёС„СЂ
    - int РёР· 4 С†РёС„СЂ

    Р’СЃС‘ С‚РёРїР° "djsvb", "19a8", "123", "19988" вЂ” РѕС€РёР±РєР°.
    """
    if value is None:
        return None

    if isinstance(value, str):
        clean = value.strip()

        if clean == "":
            return None

        if not RELEASE_YEAR_RE.fullmatch(clean):
            raise serializers.ValidationError(
                "Р С–Рє РІРёРїСѓСЃРєСѓ РјР°С” РјС–СЃС‚РёС‚Рё СЂС–РІРЅРѕ 4 С†РёС„СЂРё."
            )

        year = int(clean)

    elif isinstance(value, int):
        clean = str(value)

        if not RELEASE_YEAR_RE.fullmatch(clean):
            raise serializers.ValidationError(
                "Р С–Рє РІРёРїСѓСЃРєСѓ РјР°С” РјС–СЃС‚РёС‚Рё СЂС–РІРЅРѕ 4 С†РёС„СЂРё."
            )

        year = value

    else:
        raise serializers.ValidationError(
            "Р С–Рє РІРёРїСѓСЃРєСѓ РјР°С” РјС–СЃС‚РёС‚Рё СЂС–РІРЅРѕ 4 С†РёС„СЂРё."
        )

    if year < RELEASE_YEAR_MIN or year > RELEASE_YEAR_MAX:
        raise serializers.ValidationError(
            f"Р С–Рє РІРёРїСѓСЃРєСѓ РјР°С” Р±СѓС‚Рё РІ РјРµР¶Р°С… {RELEASE_YEAR_MIN}вЂ“{RELEASE_YEAR_MAX}."
        )

    return year

def validate_position(value) -> int:
    if value in (None, ""):
        return 0

    try:
        position = int(value)
    except (TypeError, ValueError):
        raise serializers.ValidationError({"position": "РќРµРєРѕСЂРµРєС‚РЅР° РїРѕР·РёС†С–СЏ РЅРѕС‚Рё."})

    if position < 0:
        raise serializers.ValidationError({"position": "РџРѕР·РёС†С–СЏ РЅРѕС‚Рё РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё РјРµРЅС€РѕСЋ Р·Р° 0."})

    return position


def validate_note_level(value: str) -> str:
    level = (value or "").strip()

    if not level:
        raise serializers.ValidationError({"level": "РџРѕС‚СЂС–Р±РµРЅ СЂС–РІРµРЅСЊ РЅРѕС‚Рё."})

    if level not in NOTE_LEVEL_VALUES:
        raise serializers.ValidationError({"level": "РќРµРєРѕСЂРµРєС‚РЅРёР№ СЂС–РІРµРЅСЊ РЅРѕС‚Рё."})

    return level


def validate_brand_exists(brand_id: int) -> BrandModel:
    brand = BrandModel.objects.filter(id=brand_id).first()

    if not brand:
        raise serializers.ValidationError({"brand_id": "Р‘СЂРµРЅРґ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."})

    return brand


def validate_perfumer_exists(perfumer_id: int) -> PerfumerModel:
    perfumer = PerfumerModel.objects.filter(id=perfumer_id).first()

    if not perfumer:
        raise serializers.ValidationError({"perfumer_id": "РџР°СЂС„СѓРјРµСЂР° РЅРµ Р·РЅР°Р№РґРµРЅРѕ."})

    return perfumer


def validate_note_exists(note_id: int) -> NoteModel:
    note = NoteModel.objects.filter(id=note_id).first()

    if not note:
        raise serializers.ValidationError({"note_id": "РќРѕС‚Сѓ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."})

    return note


def validate_family_exists(family_id: int) -> OlfactoryFamilyModel:
    family = OlfactoryFamilyModel.objects.filter(id=family_id).first()

    if not family:
        raise serializers.ValidationError({"family_id": "РЎС–РјРµР№СЃС‚РІРѕ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."})

    return family


def validate_fragrance_exists(fragrance_id: int) -> FragranceModel:
    fragrance = FragranceModel.objects.filter(id=fragrance_id).first()

    if not fragrance:
        raise serializers.ValidationError({"fragrance_id": "РђСЂРѕРјР°С‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."})

    return fragrance


def validate_unique_fragrance_name_for_brand(
    *,
    brand_id: int,
    name: str,
    exclude_id: int | None = None,
) -> str:
    clean_name = validate_required_name(
        value=name,
        field_name="name",
        empty_msg="РџРѕС‚СЂС–Р±РЅР° РЅР°Р·РІР° Р°СЂРѕРјР°С‚Сѓ.",
        max_len=255,
    )

    qs = FragranceModel.objects.filter(
        brand_id=brand_id,
        name__iexact=clean_name,
    )

    if exclude_id is not None:
        qs = qs.exclude(id=exclude_id)

    if qs.exists():
        raise serializers.ValidationError({"name": "РўР°РєРёР№ Р°СЂРѕРјР°С‚ Сѓ С†СЊРѕРіРѕ Р±СЂРµРЅРґСѓ РІР¶Рµ С–СЃРЅСѓС”."})

    return clean_name


def validate_official_note_not_exists_for_level(
    *,
    fragrance: FragranceModel,
    note: NoteModel,
    level: str,
) -> None:
    clean_level = validate_note_level(level)

    exists = FragranceNoteOfficialModel.objects.filter(
        fragrance=fragrance,
        note=note,
        level=clean_level,
    ).exists()

    if exists:
        raise serializers.ValidationError(
            {"note_id": "Р¦СЏ РЅРѕС‚Р° РІР¶Рµ С” РІ РѕС„С–С†С–Р№РЅРёС… РЅРѕС‚Р°С… РЅР° С†СЊРѕРјСѓ СЂС–РІРЅС–."}
        )
