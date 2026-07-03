from __future__ import annotations

import os
from uuid import uuid4


def _normalize_ext(ext: str | None, *, default: str = "bin") -> str:
    ext = str(ext or "").lower().strip().lstrip(".")

    if not ext:
        return default

    if len(ext) > 10:
        return default

    if not ext.isalnum():
        return default

    return ext


def _safe_ext(filename: str | None, *, default: str = "jpg") -> str:
    """
    Р‘РµСЂС‘Рј С‚РѕР»СЊРєРѕ СЂР°СЃС€РёСЂРµРЅРёРµ, СЃР°РјРѕ РёРјСЏ С„Р°Р№Р»Р° РѕС‚ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РЅРµ РёСЃРїРѕР»СЊР·СѓРµРј.
    Р—Р°С‰РёС‚Р° РѕС‚ path traversal / СЃС‚СЂР°РЅРЅС‹С… РёРјС‘РЅ / backslash-РїСѓС‚РµР№.
    """
    raw = str(filename or "").replace("\\", "/").rsplit("/", 1)[-1]

    if "." not in raw:
        return default

    ext = raw.rsplit(".", 1)[-1]
    return _normalize_ext(ext, default=default)


def _uuid_name(ext: str) -> str:
    return f"{uuid4()}.{_normalize_ext(ext)}"


def upload_avatar(instance, filename: str) -> str:
    ext = _safe_ext(filename, default="jpg")
    user_id = getattr(instance, "user_id", None) or getattr(instance.user, "id", "unknown-user")

    return os.path.join("avatars", str(user_id), _uuid_name(ext))


def upload_perfume_photo(instance, filename: str) -> str:
    """
    Р¤РѕС‚Рѕ РїР°СЂС„СЋРјР° СЃРѕС…СЂР°РЅСЏРµРј РєР°Рє JPEG РїРѕСЃР»Рµ watermark.
    РРјСЏ С„Р°Р№Р»Р° РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РЅРµ РёСЃРїРѕР»СЊР·СѓРµРј.
    """
    model_name = instance.content_type.model

    return os.path.join(model_name, str(instance.object_id), _uuid_name("jpg"))


def upload_perfume_collage(instance, filename: str) -> str:
    model_name = instance._meta.model_name
    ext = _safe_ext(filename, default="jpg")
    object_id = getattr(instance, "pk", None) or "new"

    return os.path.join(model_name, str(object_id), _uuid_name(ext))


def upload_object_photo(instance, filename: str) -> str:
    """
    РћР±С‰РёР№ РїСѓС‚СЊ РїРѕРґ Р»СЋР±С‹Рµ СЃСѓС‰РЅРѕСЃС‚Рё: forum topic/comment/etc.
    РџРѕСЃР»Рµ watermark СЃРѕС…СЂР°РЅСЏРµРј РєР°Рє JPEG.
    """
    model_name = instance.content_type.model

    return os.path.join(model_name, str(instance.object_id), _uuid_name("jpg"))


def upload_object_cover(instance, filename: str) -> str:
    model_name = instance.content_type.model

    return os.path.join(model_name, "covers", str(instance.object_id), _uuid_name("jpg"))
