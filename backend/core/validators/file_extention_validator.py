from __future__ import annotations

from django.core.exceptions import ValidationError

ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


def _extract_extension(file_or_name) -> str:
    """
    РџСЂРёР№РјР°С” File-like Р· .name Р°Р±Рѕ СЂСЏРґРѕРє.
    РќРµ РґРѕРІС–СЂСЏС”РјРѕ С€Р»СЏС…Сѓ/РЅР°Р·РІС– С„Р°Р№Р»Р° РІС–Рґ РєРѕСЂРёСЃС‚СѓРІР°С‡Р°.
    """
    if hasattr(file_or_name, "name"):
        filename = str(file_or_name.name)
    elif isinstance(file_or_name, str):
        filename = file_or_name
    else:
        raise ValidationError("РќРµРєРѕСЂРµРєС‚РЅРёР№ С‚РёРї С„Р°Р№Р»Р°")

    safe_name = filename.replace("\\", "/").rsplit("/", 1)[-1].strip()

    if not safe_name or "." not in safe_name:
        raise ValidationError("Р¤Р°Р№Р» РјР°С” РјР°С‚Рё СЂРѕР·С€РёСЂРµРЅРЅСЏ")

    ext = safe_name.rsplit(".", 1)[-1].lower().strip()

    if not ext:
        raise ValidationError("Р¤Р°Р№Р» РјР°С” РјР°С‚Рё СЂРѕР·С€РёСЂРµРЅРЅСЏ")

    return ext


def validate_image_extension(file_or_name):
    ext = _extract_extension(file_or_name)

    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(f"РќРµРґРѕРїСѓСЃС‚РёРјРµ СЂРѕР·С€РёСЂРµРЅРЅСЏ: {ext}")

    return file_or_name
