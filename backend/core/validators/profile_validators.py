import re

from django.core.exceptions import ValidationError
from core.enums.name_enum import NameRegexEnum, DisplayNameRegexEnum



def validate_name(value: str) -> str:
    v = (value or "").strip()
    if not v:
        raise ValidationError("Name is required.")

    if "  " in v:
        raise ValidationError("No double spaces.")

    for rule in NameRegexEnum:
        if not re.fullmatch(rule.pattern, v):
            raise ValidationError(rule.msg)

    return v



DISPLAY_NAME_MIN = 3
DISPLAY_NAME_MAX = 30

# 1) С‚РѕР»СЊРєРѕ Р»Р°С‚РёРЅРёС†Р°/С†РёС„СЂС‹/._-
# 2) РїРµСЂРІС‹Р№ Рё РїРѕСЃР»РµРґРЅРёР№ СЃРёРјРІРѕР» вЂ” Р±СѓРєРІР°/С†РёС„СЂР°
DISPLAY_NAME_RE = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?$")
DISPLAY_NAME_RESERVED_RE = re.compile(
    r"(admin|administrator|administration|moderator|moderation|support)",
    re.IGNORECASE,
)

def normalize_display_name(value: str) -> str:
    v = (value or "").strip()
    # РЅРёРєР°РєРёС… РїСЂРѕР±РµР»РѕРІ РІРЅСѓС‚СЂРё
    v = re.sub(r"\s+", "", v)
    return v

def validate_display_name(value: str) -> str:
    v = normalize_display_name(value)

    if len(v) < DISPLAY_NAME_MIN or len(v) > DISPLAY_NAME_MAX:
        raise ValidationError(f"Display name must be {DISPLAY_NAME_MIN}-{DISPLAY_NAME_MAX} characters long.")

    if not DISPLAY_NAME_RE.match(v):
        raise ValidationError("Display name may contain only letters, digits, dot, underscore, hyphen; "
                              "and must start/end with a letter or digit.")

    if DISPLAY_NAME_RESERVED_RE.search(v):
        raise ValidationError("РќС–РєРЅРµР№Рј РјС–СЃС‚РёС‚СЊ Р·Р°СЂРµР·РµСЂРІРѕРІР°РЅРµ СЃР»СѓР¶Р±РѕРІРµ СЃР»РѕРІРѕ.")

    return v

def display_name_ci(value: str) -> str:
    return normalize_display_name(value).lower()
