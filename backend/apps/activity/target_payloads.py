from __future__ import annotations

from typing import Any


COMMENT_PREVIEW_MAX_LENGTH = 180


def _read_string_attr(obj: Any, *names: str) -> str:
    if obj is None:
        return ""

    for name in names:
        value = getattr(obj, name, None)

        if value:
            return str(value).strip()

    return ""


def _strip_at(value: str) -> str:
    return value.strip().lstrip("@").strip()


def _truncate(value: str, *, limit: int) -> str:
    value = value.strip()

    if len(value) <= limit:
        return value

    return f"{value[: limit - 1].rstrip()}вЂ¦"


def _target_key(target) -> str:
    meta = target._meta
    return f"{meta.app_label}.{meta.model_name}"


def _build_target_title(target) -> str:
    title = _read_string_attr(
        target,
        "title",
        "name",
        "display_name",
        "full_title",
        "raw_name",
    )
    if title:
        return title

    fragrance = getattr(target, "fragrance", None)
    if fragrance is not None:
        brand = getattr(fragrance, "brand", None)
        brand_name = _read_string_attr(brand, "name") if brand is not None else ""
        fragrance_name = _read_string_attr(fragrance, "name")

        if brand_name and fragrance_name:
            return f"{brand_name} {fragrance_name}"

        if fragrance_name:
            return fragrance_name

    return f"{target._meta.verbose_name.title()} #{target.pk}"


def _build_target_subtitle(target) -> str:
    parts: list[str] = []

    concentration = _read_string_attr(target, "concentration")
    if concentration:
        parts.append(concentration)

    if hasattr(target, "actual_volume_ml"):
        parts.append(f"{target.actual_volume_ml} РјР»")
    elif hasattr(target, "available_volume_ml"):
        parts.append(f"РґРѕСЃС‚СѓРїРЅРѕ {target.available_volume_ml} РјР»")

    if getattr(target, "is_sample", False):
        parts.append("РїСЂРѕР±РЅРёРє")

    if getattr(target, "is_vintage", False):
        parts.append("vintage")

    return " вЂў ".join(parts)


def _build_target_slug(target) -> str:
    return _strip_at(
        _read_string_attr(
            target,
            "slug",
            "public_slug",
            "display_name",
            "username",
        )
    )


def _build_base_target_payload(target) -> dict:
    meta = target._meta

    payload = {
        "app": meta.app_label,
        "model": meta.model_name,
        "id": target.pk,
        "title": _build_target_title(target),
        "subtitle": _build_target_subtitle(target),
    }

    slug = _build_target_slug(target)
    if slug:
        payload["slug"] = slug

    display_name = _strip_at(_read_string_attr(target, "display_name", "username"))
    if display_name:
        payload["display_name"] = display_name

    offer_kind = _read_string_attr(target, "offer_kind")
    if offer_kind:
        payload["type"] = offer_kind

    fragrance_id = getattr(target, "fragrance_id", None)
    if fragrance_id:
        payload["fragrance_id"] = fragrance_id

    return payload


def _build_fragrance_payload(target) -> dict:
    brand = getattr(target, "brand", None)

    return {
        "id": target.pk,
        "slug": getattr(target, "slug", "") or "",
        "name": getattr(target, "name", "") or "",
        "brand": {
            "name": getattr(brand, "name", "") if brand is not None else "",
            "slug": getattr(brand, "slug", "") if brand is not None else "",
        },
    }


def _build_forum_topic_payload(target) -> dict:
    section = getattr(target, "section", None)

    return {
        "id": target.pk,
        "title": getattr(target, "title", "") or "",
        "slug": getattr(target, "slug", "") or "",
        "section_id": getattr(target, "section_id", None),
        "section_title": getattr(section, "title", "") if section is not None else "",
        "section_slug": getattr(section, "slug", "") if section is not None else "",
    }


def _build_comment_payload(comment) -> dict:
    body = getattr(comment, "body", "") or ""

    return {
        "id": comment.pk,
        "comment_id": comment.pk,
        "preview": _truncate(body, limit=COMMENT_PREVIEW_MAX_LENGTH),
        "is_deleted": bool(getattr(comment, "is_deleted", False)),
        "parent_id": getattr(comment, "parent_id", None),
    }


def build_activity_target_payload(target) -> dict:
    """
    Payload С†РµР»РµРІРѕРіРѕ РѕР±СЉРµРєС‚Р°, РєРѕС‚РѕСЂС‹Р№ frontend РґРѕР»Р¶РµРЅ СѓРјРµС‚СЊ РѕС‚РєСЂС‹С‚СЊ.

    Р”Р»СЏ РѕР±С‹С‡РЅС‹С… РѕР±СЉРµРєС‚РѕРІ СЌС‚Рѕ СЃР°Рј РѕР±СЉРµРєС‚.
    Р”Р»СЏ CommentModel СЌС‚Рѕ РѕР±СЉРµРєС‚, Рє РєРѕС‚РѕСЂРѕРјСѓ РєРѕРјРјРµРЅС‚Р°СЂРёР№ РѕС‚РЅРѕСЃРёС‚СЃСЏ,
    РїРѕС‚РѕРјСѓ С‡С‚Рѕ РѕС‚РґРµР»СЊРЅРѕР№ РїСѓР±Р»РёС‡РЅРѕР№ СЃС‚СЂР°РЅРёС†С‹ РєРѕРјРјРµРЅС‚Р°СЂРёСЏ Сѓ РЅР°СЃ РЅРµС‚.
    """
    if target is None:
        return {}

    key = _target_key(target)

    if key == "comments.commentmodel":
        parent_target = getattr(target, "content_object", None)

        if parent_target is not None:
            return build_activity_target_payload(parent_target)

    return _build_base_target_payload(target)


def build_activity_target_context(target) -> dict:
    """
    Р•РґРёРЅС‹Р№ РєРѕРЅС‚РµРєСЃС‚ РґР»СЏ activity payload.

    Р’СЃРµРіРґР° СЃС‚Р°СЂР°РµС‚СЃСЏ РїРѕР»РѕР¶РёС‚СЊ:
    - target: РѕР±СЉРµРєС‚, РїРѕ РєРѕС‚РѕСЂРѕРјСѓ РґРѕР»Р¶РЅР° СЃС‚СЂРѕРёС‚СЊСЃСЏ СЃСЃС‹Р»РєР°;
    - item: alias РґР»СЏ СЃС‚Р°СЂРѕРіРѕ frontend-РєРѕРґР°;
    - topic/fragrance/comment: РґРѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹Рµ СЃС‚СЂСѓРєС‚СѓСЂРёСЂРѕРІР°РЅРЅС‹Рµ РґР°РЅРЅС‹Рµ.
    """
    if target is None:
        return {}

    key = _target_key(target)

    if key == "comments.commentmodel":
        parent_target = getattr(target, "content_object", None)

        if parent_target is not None:
            payload = build_activity_target_context(parent_target)
        else:
            payload = {
                "target": _build_base_target_payload(target),
            }

        payload["comment"] = _build_comment_payload(target)
        payload["comment_id"] = target.pk

        if "item" not in payload and "target" in payload:
            payload["item"] = payload["target"]

        return payload

    target_payload = _build_base_target_payload(target)

    payload = {
        "target": target_payload,
        "item": target_payload,
    }

    if key == "fragrance.fragrancemodel":
        payload["fragrance"] = _build_fragrance_payload(target)

    if key == "forum.forumtopicmodel":
        payload["topic"] = _build_forum_topic_payload(target)

    return payload
