from __future__ import annotations

from typing import Any

from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError

from apps.favorites.availability import get_favorite_unavailable_reason
from apps.favorites.favorites_policy import is_favorite_target_allowed
from apps.favorites.models import PerfumeFavoriteModel


def validation_message(exc: ValidationError) -> str:
    if hasattr(exc, "messages") and exc.messages:
        return str(exc.messages[0])

    return str(exc)


def parse_favorite_target(raw_target: Any):
    if not isinstance(raw_target, dict):
        raise ValidationError("РќРµРєРѕСЂРµРєС‚РЅРёР№ target.")

    ct_input = raw_target.get("content_type")
    object_id = raw_target.get("object_id")

    if ct_input in (None, ""):
        app_label = raw_target.get("app")
        model_name = raw_target.get("model")

        if app_label and model_name:
            ct_input = f"{app_label}.{model_name}"

    if object_id in (None, ""):
        object_id = raw_target.get("id")

    object_id = validate_object_id(object_id)
    ct = resolve_content_type(ct_input)

    validate_favorite_content_type(ct)

    model_class = ct.model_class()

    if model_class is None:
        raise ValidationError("РќРµРІС–СЂРЅРёР№ content_type.")

    target = model_class.objects.filter(pk=object_id).first()

    if target is None:
        raise ValidationError("РћР±'С”РєС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.")

    return target


def validate_object_id(value: Any) -> int:
    if value in (None, ""):
        raise ValidationError("РџРѕС‚СЂС–Р±РµРЅ object_id.")

    try:
        object_id = int(value)
    except (TypeError, ValueError):
        raise ValidationError("object_id РјР°С” Р±СѓС‚Рё С‡РёСЃР»РѕРј.")

    if object_id <= 0:
        raise ValidationError("object_id РјР°С” Р±СѓС‚Рё > 0.")

    return object_id


def resolve_content_type(value: Any) -> ContentType:
    if value in (None, ""):
        raise ValidationError("РџРѕС‚СЂС–Р±РµРЅ content_type.")

    ct = None

    if isinstance(value, int) or (isinstance(value, str) and value.strip().isdigit()):
        ct = ContentType.objects.filter(pk=int(value)).first()

    elif isinstance(value, str):
        normalized = value.strip().lower()

        if "." in normalized:
            app_label, model_name = normalized.split(".", 1)

            ct = ContentType.objects.filter(
                app_label=app_label,
                model=model_name,
            ).first()
        else:
            candidates = ContentType.objects.filter(model=normalized)

            for candidate in candidates:
                if is_favorite_target_allowed(candidate):
                    ct = candidate
                    break

    if ct is None:
        raise ValidationError("РќРµРІС–РґРѕРјРёР№ content_type.")

    return ct


def validate_favorite_content_type(ct: ContentType) -> None:
    if not is_favorite_target_allowed(ct):
        raise ValidationError("Р¦РµР№ С‚РёРї РѕР±КјС”РєС‚Р° РЅРµ РјРѕР¶РЅР° РґРѕРґР°С‚Рё РґРѕ РѕР±СЂР°РЅРѕРіРѕ.")


def favorite_exists(*, user, target) -> bool:
    ct = ContentType.objects.get_for_model(
        type(target),
        for_concrete_model=False,
    )

    return PerfumeFavoriteModel.objects.filter(
        user=user,
        content_type=ct,
        object_id=target.pk,
    ).exists()


def validate_favorite_not_exists(*, user, target) -> None:
    if favorite_exists(user=user, target=target):
        raise ValidationError("Р¦РµР№ РѕР±'С”РєС‚ РІР¶Рµ РІ РѕР±СЂР°РЅРѕРјСѓ.")


def validate_target_can_be_favorited(*, user, target) -> None:
    reason = get_favorite_unavailable_reason(target, user)

    if reason == "blocked":
        raise ValidationError("Р’Рё РЅРµ РјРѕР¶РµС‚Рµ РґРѕРґР°С‚Рё С†РµР№ РѕР±КјС”РєС‚ РґРѕ РѕР±СЂР°РЅРѕРіРѕ.")

    if reason == "hidden":
        raise ValidationError("Р¦РµР№ РѕР±'С”РєС‚ РЅРµРґРѕСЃС‚СѓРїРЅРёР№.")
