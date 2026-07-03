from __future__ import annotations

from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.db.models import Q

from apps.social.models import BlockModel
from apps.social.subscriptions_policy import is_allowed_target
from core.utils.target_owner import get_target_owner_id


def validate_not_self(*, actor, target, message: str) -> None:
    if not actor or not target or actor.pk == target.pk:
        raise ValidationError(message)


def validate_active_target(target) -> None:
    if not target or not getattr(target, "is_active", False):
        raise ValidationError("РљРѕСЂРёСЃС‚СѓРІР°С‡ РЅРµРґРѕСЃС‚СѓРїРЅРёР№.")


def validate_not_blocked_between(*, actor, target) -> None:
    if BlockModel.objects.filter(
        Q(blocker=actor, blocked=target)
        | Q(blocker=target, blocked=actor)
    ).exists():
        raise ValidationError("Р”С–СЏ РЅРµРґРѕСЃС‚СѓРїРЅР° С‡РµСЂРµР· Р±Р»РѕРєСѓРІР°РЅРЅСЏ.")


def validate_follow_payload(*, actor, target) -> None:
    validate_active_target(target)
    validate_not_self(
        actor=actor,
        target=target,
        message="РќРµРјРѕР¶Р»РёРІРѕ РїС–РґРїРёСЃР°С‚РёСЃСЏ РЅР° СЃРµР±Рµ.",
    )
    validate_not_blocked_between(actor=actor, target=target)


def validate_block_payload(*, actor, target) -> None:
    validate_active_target(target)
    validate_not_self(
        actor=actor,
        target=target,
        message="РќРµРјРѕР¶Р»РёРІРѕ Р·Р°Р±Р»РѕРєСѓРІР°С‚Рё СЃРµР±Рµ.",
    )


def get_subscription_target_ct(target) -> ContentType:
    if not target or not getattr(target, "pk", None):
        raise ValidationError("РќРµРєРѕСЂРµРєС‚РЅРёР№ РѕР±КјС”РєС‚ РїС–РґРїРёСЃРєРё.")

    ct = ContentType.objects.get_for_model(
        target,
        for_concrete_model=False,
    )

    if not is_allowed_target(ct.app_label, ct.model):
        raise ValidationError("РџС–РґРїРёСЃРєР° РЅР° С†РµР№ С‚РёРї РѕР±КјС”РєС‚Р° РЅРµ РїС–РґС‚СЂРёРјСѓС”С‚СЊСЃСЏ.")

    return ct


def validate_subscription_payload(*, user, target) -> ContentType:
    if not user or not user.is_authenticated:
        raise ValidationError("РџРѕС‚СЂС–Р±РЅР° Р°РІС‚РѕСЂРёР·Р°С†С–СЏ.")

    ct = get_subscription_target_ct(target)

    if getattr(target, "is_hidden", False):
        raise ValidationError("РџСЂРёС…РѕРІР°РЅРёР№ РѕР±КјС”РєС‚ РЅРµРґРѕСЃС‚СѓРїРЅРёР№ РґР»СЏ РїС–РґРїРёСЃРєРё.")

    if hasattr(target, "is_active") and not getattr(target, "is_active", True):
        raise ValidationError("РќРµР°РєС‚РёРІРЅРёР№ РѕР±КјС”РєС‚ РЅРµРґРѕСЃС‚СѓРїРЅРёР№ РґР»СЏ РїС–РґРїРёСЃРєРё.")

    owner_id = get_target_owner_id(target)

    if owner_id and owner_id != user.id:
        owner = user.__class__.objects.filter(id=owner_id, is_active=True).first()

        if owner is None:
            raise ValidationError("РћР±КјС”РєС‚ РЅРµРґРѕСЃС‚СѓРїРЅРёР№ РґР»СЏ РїС–РґРїРёСЃРєРё.")

        validate_not_blocked_between(actor=user, target=owner)

    return ct
