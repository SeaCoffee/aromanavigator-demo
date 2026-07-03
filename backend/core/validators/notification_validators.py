from __future__ import annotations

from typing import Any

from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError


def validation_message(exc: ValidationError) -> str:
    if hasattr(exc, "messages") and exc.messages:
        return str(exc.messages[0])
    return str(exc)


def validate_notification_verb(verb: str) -> str:
    value = (verb or "").strip()

    if not value:
        raise ValidationError("verb РѕР±РѕРІ'СЏР·РєРѕРІРёР№.")

    if len(value) > 120:
        raise ValidationError("verb Р·Р°РЅР°РґС‚Рѕ РґРѕРІРіРёР№.")

    return value


def validate_notification_payload(payload: Any) -> dict:
    if payload is None:
        return {}

    if not isinstance(payload, dict):
        raise ValidationError("payload РјР°С” Р±СѓС‚Рё РѕР±'С”РєС‚РѕРј.")

    return payload


def content_type_for_object(obj):
    if obj is None:
        raise ValidationError("actor_obj РѕР±РѕРІ'СЏР·РєРѕРІРёР№.")

    obj_id = getattr(obj, "pk", None)

    if not obj_id:
        raise ValidationError("РћР±'С”РєС‚ РјР°С” Р±СѓС‚Рё Р·Р±РµСЂРµР¶РµРЅРёР№ РїРµСЂРµРґ СЃС‚РІРѕСЂРµРЅРЅСЏРј СѓРІРµРґРѕРјР»РµРЅРЅСЏ.")

    return ContentType.objects.get_for_model(
        obj,
        for_concrete_model=False,
    ), int(obj_id)


def optional_content_type_for_object(obj):
    if obj is None:
        return None, None

    return content_type_for_object(obj)


def resolve_content_type_triplet(
    *,
    app: str | None = None,
    model: str | None = None,
    object_id: int | str | None = None,
):
    app_value = (app or "").strip().lower()
    model_value = (model or "").strip().lower()

    if object_id in ("", None):
        id_value = None
    else:
        try:
            id_value = int(object_id)
        except (TypeError, ValueError):
            raise ValidationError("target_id РјР°С” Р±СѓС‚Рё С‡РёСЃР»РѕРј.")

        if id_value <= 0:
            raise ValidationError("target_id РјР°С” Р±СѓС‚Рё > 0.")

    all_empty = app_value == "" and model_value == "" and id_value is None
    all_filled = app_value != "" and model_value != "" and id_value is not None

    if not (all_empty or all_filled):
        raise ValidationError("target РјР°С” Р±СѓС‚Рё Р°Р±Рѕ РїРѕРІРЅС–СЃС‚СЋ Р·Р°РґР°РЅРёР№, Р°Р±Рѕ РїРѕРІРЅС–СЃС‚СЋ РїРѕСЂРѕР¶РЅС–Р№.")

    if all_empty:
        return None, None

    ct = ContentType.objects.filter(
        app_label=app_value,
        model=model_value,
    ).first()

    if ct is None:
        raise ValidationError("РќРµРІС–РґРѕРјРёР№ target content_type.")

    return ct, id_value
