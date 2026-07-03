from __future__ import annotations

from typing import Any

from django.core.exceptions import ValidationError

from core.choises.activity_choises import ActivityVerb


def validation_message(exc: ValidationError) -> str:
    if hasattr(exc, "messages") and exc.messages:
        return str(exc.messages[0])
    return str(exc)


def normalize_activity_triplet(
    *,
    target_app: str | None = "",
    target_model: str | None = "",
    target_id: int | str | None = None,
) -> tuple[str, str, int | None]:
    app = (target_app or "").strip().lower()
    model = (target_model or "").strip().lower()

    if target_id in ("", None):
        obj_id = None
    else:
        try:
            obj_id = int(target_id)
        except (TypeError, ValueError):
            raise ValidationError("target_id РјР°С” Р±СѓС‚Рё С‡РёСЃР»РѕРј.")

        if obj_id <= 0:
            raise ValidationError("target_id РјР°С” Р±СѓС‚Рё > 0.")

    all_empty = app == "" and model == "" and obj_id is None
    all_filled = app != "" and model != "" and obj_id is not None

    if not (all_empty or all_filled):
        raise ValidationError("Р”Р»СЏ С†С–Р»С– С‚СЂРµР±Р° РІРєР°Р·Р°С‚Рё РІСЃС– РїРѕР»СЏ app/model/id Р°Р±Рѕ РЅРµ РІРєР°Р·СѓРІР°С‚Рё Р¶РѕРґРЅРѕРіРѕ.")

    return app, model, obj_id


def activity_triplet_from_object(target_obj) -> tuple[str, str, int]:
    meta = target_obj._meta

    return (
        meta.app_label,
        meta.model_name,
        int(target_obj.pk),
    )


def validate_activity_verb(verb: str) -> str:
    value = (verb or "").strip()

    if value not in ActivityVerb.values:
        raise ValidationError("РќРµРґРѕРїСѓСЃС‚РёРјРµ Р·РЅР°С‡РµРЅРЅСЏ verb.")

    return value


def validate_activity_payload(payload: Any) -> dict:
    if payload is None:
        return {}

    if not isinstance(payload, dict):
        raise ValidationError("payload РјР°С” Р±СѓС‚Рё РѕР±'С”РєС‚РѕРј.")

    return payload
