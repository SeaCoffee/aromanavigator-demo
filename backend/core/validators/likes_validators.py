from __future__ import annotations

from typing import Any

from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError

from apps.likes.likes_policy import is_like_target_allowed
from apps.likes.models import LikeModel
from apps.social.selectors import blocked_relation_exists
from core.utils.target_owner import get_target_owner_id


def validation_message(exc: ValidationError) -> str:
    if hasattr(exc, "messages") and exc.messages:
        return str(exc.messages[0])

    return str(exc)


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

    content_type = None

    if isinstance(value, int) or (isinstance(value, str) and value.strip().isdigit()):
        content_type = ContentType.objects.filter(pk=int(value)).first()

    elif isinstance(value, str):
        normalized = value.strip().lower()

        if "." in normalized:
            app_label, model_name = normalized.split(".", 1)

            content_type = ContentType.objects.filter(
                app_label=app_label,
                model=model_name,
            ).first()
        else:
            candidates = ContentType.objects.filter(model=normalized)

            for candidate in candidates:
                if is_like_target_allowed(candidate):
                    content_type = candidate
                    break

    if content_type is None:
        raise ValidationError("РќРµРІС–РґРѕРјРёР№ content_type.")

    return content_type


def validate_like_content_type(content_type: ContentType) -> None:
    if not is_like_target_allowed(content_type):
        raise ValidationError("Р¦РµР№ С‚РёРї РѕР±'С”РєС‚Р° РЅРµ РјРѕР¶РЅР° РІРїРѕРґРѕР±Р°С‚Рё.")


def validate_like_target_state(target) -> None:
    if getattr(target, "is_deleted", False):
        raise ValidationError("Р’РёРґР°Р»РµРЅРёР№ РѕР±'С”РєС‚ РЅРµ РјРѕР¶РЅР° РІРїРѕРґРѕР±Р°С‚Рё.")

    if getattr(target, "is_hidden", False):
        raise ValidationError("РџСЂРёС…РѕРІР°РЅРёР№ РѕР±'С”РєС‚ РЅРµ РјРѕР¶РЅР° РІРїРѕРґРѕР±Р°С‚Рё.")

    if hasattr(target, "is_active") and not getattr(target, "is_active", True):
        raise ValidationError("РќРµР°РєС‚РёРІРЅРёР№ РѕР±'С”РєС‚ РЅРµ РјРѕР¶РЅР° РІРїРѕРґРѕР±Р°С‚Рё.")


def validate_like_target_for_user(*, user, target) -> None:
    validate_like_target_state(target)

    owner_id = get_target_owner_id(target)

    if not owner_id or owner_id == user.id:
        return

    owner = user.__class__.objects.filter(id=owner_id, is_active=True).first()

    if owner is None or blocked_relation_exists(actor=user, target=owner):
        raise ValidationError("Р”С–СЏ РЅРµРґРѕСЃС‚СѓРїРЅР° С‡РµСЂРµР· Р±Р»РѕРєСѓРІР°РЅРЅСЏ.")


def parse_like_target(raw_target: Any):
    """
    РћСЃРЅРѕРІРЅРѕР№ С„РѕСЂРјР°С‚:

    {
      "content_type": "forum.forumtopicmodel",
      "object_id": 3
    }

    Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕ РїРѕРґРґРµСЂР¶РёРІР°РµС‚СЃСЏ:

    {
      "app": "forum",
      "model": "forumtopicmodel",
      "id": 3
    }
    """

    if not isinstance(raw_target, dict):
        raise ValidationError("РќРµРєРѕСЂРµРєС‚РЅРёР№ target.")

    content_type_input = raw_target.get("content_type")
    object_id = raw_target.get("object_id")

    if content_type_input in (None, ""):
        app_label = raw_target.get("app")
        model_name = raw_target.get("model")

        if app_label and model_name:
            content_type_input = f"{app_label}.{model_name}"

    if object_id in (None, ""):
        object_id = raw_target.get("id")

    object_id = validate_object_id(object_id)
    content_type = resolve_content_type(content_type_input)

    validate_like_content_type(content_type)

    model_class = content_type.model_class()

    if model_class is None:
        raise ValidationError("РќРµРІС–СЂРЅРёР№ content_type.")

    target = model_class.objects.filter(pk=object_id).first()

    if target is None:
        raise ValidationError("РћР±'С”РєС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.")

    return target


def validate_like_not_exists(*, user, target) -> None:
    content_type = ContentType.objects.get_for_model(
        target,
        for_concrete_model=False,
    )

    exists = LikeModel.objects.filter(
        user=user,
        content_type=content_type,
        object_id=target.pk,
    ).exists()

    if exists:
        raise ValidationError("Р’Рё РІР¶Рµ РІРїРѕРґРѕР±Р°Р»Рё С†РµР№ РѕР±'С”РєС‚.")
