from __future__ import annotations
import re, unicodedata
from typing import Optional
from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator

from core.enums.order_enums import EmailRegexEnum

UA_PHONE = r"^\+380\d{9}$"

def normalize_phone(s: str) -> str:
    s = (s or "").strip()
    if s.startswith("00"):
        s = "+" + s[2:]
    compact = re.sub(r"[()\s\-]", "", s)
    digits = re.sub(r"\D", "", compact)

    if len(digits) == 10 and digits.startswith("0"):
        return "+38" + digits
    if len(digits) == 11 and digits.startswith("80"):
        return "+3" + digits
    if len(digits) == 12 and digits.startswith("380"):
        return "+" + digits

    return compact

def validate_phone(value: str) -> str:
    v = normalize_phone(value)
    if re.fullmatch(UA_PHONE, v):
        return v
    raise ValidationError(
        "Р’РєР°Р¶С–С‚СЊ С‚РµР»РµС„РѕРЅ СЏРє 067XXXXXXX, 8067XXXXXXX, 38067XXXXXXX Р°Р±Рѕ +38067XXXXXXX."
    )

def validate_email(value: Optional[str]) -> str:
    v = (value or "").strip()
    if not v:
        return v
    # РјРѕР¶РЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ EmailRegexEnum.SIMPLE.pattern, РЅРѕ EmailValidator СѓР¶Рµ С…РѕСЂРѕС€
    EmailValidator(message=EmailRegexEnum.SIMPLE.msg)(v)
    return v

def _unicode_letters_spaces_ok(s: str) -> bool:
    for ch in s:
        if ch in " -'вЂ™`.":
            continue
        if unicodedata.category(ch).startswith("L"):
            continue
        return False
    return True

def _squash_ws(s: str) -> str:
    return " ".join((s or "").strip().split())

def validate_name(value: str) -> str:
    v = _squash_ws(value)
    if len(v) < 2 or not _unicode_letters_spaces_ok(v):
        raise ValidationError(
            "Р†РјКјСЏ РјРѕР¶Рµ РјС–СЃС‚РёС‚Рё Р»С–С‚РµСЂРё, РїСЂРѕР±С–Р»Рё, РґРµС„С–СЃ, Р°РїРѕСЃС‚СЂРѕС„ С– РєСЂР°РїРєСѓ; "
            "РјС–РЅС–РјР°Р»СЊРЅР° РґРѕРІР¶РёРЅР° вЂ” 2 СЃРёРјРІРѕР»Рё."
        )
    return v

def validate_city(value: str) -> str:
    v = _squash_ws(value)
    if len(v) < 2 or not _unicode_letters_spaces_ok(v):
        raise ValidationError(
            "РќР°Р·РІР° РјС–СЃС‚Р° РјРѕР¶Рµ РјС–СЃС‚РёС‚Рё Р»С–С‚РµСЂРё, РїСЂРѕР±С–Р»Рё, РґРµС„С–СЃ, Р°РїРѕСЃС‚СЂРѕС„ С– РєСЂР°РїРєСѓ; "
            "РјС–РЅС–РјР°Р»СЊРЅР° РґРѕРІР¶РёРЅР° вЂ” 2 СЃРёРјРІРѕР»Рё."
        )
    return v

def validate_address(value: Optional[str]) -> str:
    v = _squash_ws(value)
    if v and len(v) < 5:
        raise ValidationError("РђРґСЂРµСЃР° РјР°С” РјС–СЃС‚РёС‚Рё С‰РѕРЅР°Р№РјРµРЅС€Рµ 5 СЃРёРјРІРѕР»С–РІ.")
    return v

# ISO2 вЂ” РјРѕР¶РЅРѕ РІС‹РЅРµСЃС‚Рё РІ settings, РЅРѕ РѕСЃС‚Р°РІР»СЋ Р·РґРµСЃСЊ
ISO2 = {"UA","PL","DE","GB","US","FR","IT","ES","NL","BE","SE","NO","DK","FI","AT","CH","CZ","SK","HU","RO","BG","LT","LV","EE","IE","PT","GR","IS","LU","SI","HR"}

def validate_country_iso2(value: str) -> str:
    v = (value or "").strip().upper()
    if v not in ISO2:
        raise ValidationError(
            "РљРѕРґ РєСЂР°С—РЅРё РјР°С” РІС–РґРїРѕРІС–РґР°С‚Рё ISO 3166-1 alpha-2, РЅР°РїСЂРёРєР»Р°Рґ UA, PL Р°Р±Рѕ DE."
        )
    return v

POSTAL = {
    "UA": (r'^\d{5}$', "РџРѕС€С‚РѕРІРёР№ С–РЅРґРµРєСЃ РЈРєСЂР°С—РЅРё РјР°С” СЃРєР»Р°РґР°С‚РёСЃСЏ Р· 5 С†РёС„СЂ."),
    "US": (r'^\d{5}(-\d{4})?$', "РџРѕС€С‚РѕРІРёР№ С–РЅРґРµРєСЃ РЎРЁРђ РјР°С” С„РѕСЂРјР°С‚ 12345 Р°Р±Рѕ 12345-6789."),
    "GB": (r'^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$', "РџРѕС€С‚РѕРІРёР№ С–РЅРґРµРєСЃ Р’РµР»РёРєРѕС— Р‘СЂРёС‚Р°РЅС–С— РјР°С” С„РѕСЂРјР°С‚ РЅР° Р·СЂР°Р·РѕРє SW1A 1AA."),
    "DE": (r'^\d{5}$', "РџРѕС€С‚РѕРІРёР№ С–РЅРґРµРєСЃ РќС–РјРµС‡С‡РёРЅРё РјР°С” СЃРєР»Р°РґР°С‚РёСЃСЏ Р· 5 С†РёС„СЂ."),
    "PL": (r'^\d{2}-\d{3}$', "РџРѕС€С‚РѕРІРёР№ С–РЅРґРµРєСЃ РџРѕР»СЊС‰С– РјР°С” С„РѕСЂРјР°С‚ 12-345."),
}

def _postal_fallback(v: str) -> str:
    v = (v or "").strip().upper()
    if not re.match(r'^[A-Z0-9][A-Z0-9 \-]{2,9}$', v):
        raise ValidationError("РќРµРєРѕСЂРµРєС‚РЅРёР№ С„РѕСЂРјР°С‚ РїРѕС€С‚РѕРІРѕРіРѕ С–РЅРґРµРєСЃСѓ.")
    return v

def validate_postal_code(value: str, country_iso2: Optional[str] = None) -> str:
    v = (value or "").strip().upper()
    if country_iso2:
        rule = POSTAL.get(country_iso2.upper())
        if rule and not re.match(rule[0], v):
            raise ValidationError(rule[1])
        if rule:
            return v
    return _postal_fallback(v)

def validate_delivery_point(value: Optional[str]) -> str:
    v = (value or "").strip()
    if not v:
        return v
    if len(v) < 2:
        raise ValidationError("Р’РєР°Р¶С–С‚СЊ РЅРѕРјРµСЂ Р°Р±Рѕ РЅР°Р·РІСѓ РІС–РґРґС–Р»РµРЅРЅСЏ С‡Рё РїРѕС€С‚РѕРјР°С‚Р°.")
    if len(v) > 120:
        raise ValidationError("РџСѓРЅРєС‚ РґРѕСЃС‚Р°РІРєРё РјР°С” РјС–СЃС‚РёС‚Рё РЅРµ Р±С–Р»СЊС€Рµ 120 СЃРёРјРІРѕР»С–РІ.")
    return v
