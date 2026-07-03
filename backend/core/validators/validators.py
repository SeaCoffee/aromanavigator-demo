from __future__ import annotations

from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError

from apps.social.subscriptions_policy import is_allowed_target


def get_subscription_target_ct(target) -> ContentType:
    if not target or not getattr(target, "pk", None):
        raise ValidationError("РќРµРєРѕСЂРµРєС‚РЅРёР№ РѕР±КјС”РєС‚ РїС–РґРїРёСЃРєРё.")

    ct = ContentType.objects.get_for_model(
        type(target),
        for_concrete_model=False,
    )

    if not is_allowed_target(ct.app_label, ct.model):
        raise ValidationError("РџС–РґРїРёСЃРєР° РЅР° С†РµР№ С‚РёРї РѕР±КјС”РєС‚Р° РЅРµ РїС–РґС‚СЂРёРјСѓС”С‚СЊСЃСЏ.")

    return ct


def validate_subscription_payload(*, user, target) -> ContentType:
    if not user or not user.is_authenticated:
        raise ValidationError("РџРѕС‚СЂС–Р±РЅР° Р°РІС‚РѕСЂРёР·Р°С†С–СЏ.")

    return get_subscription_target_ct(target)
