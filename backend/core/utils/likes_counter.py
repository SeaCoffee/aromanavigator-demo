from __future__ import annotations

import logging

from django.db.models import F
from django.db.models.functions import Greatest

from apps.likes.likes_policy import get_like_counter_field


logger = logging.getLogger(__name__)


def increment_likes_counter(target, delta: int) -> None:
    """
    РђС‚РѕРјР°СЂРЅРѕ РѕР±РЅРѕРІР»СЏРµС‚ likes_count Сѓ РѕР±СЉРµРєС‚Р°, РµСЃР»Рё РґР»СЏ РµРіРѕ С‚РёРїР° РЅР°СЃС‚СЂРѕРµРЅ СЃС‡С‘С‚С‡РёРє.
    """

    field_name = get_like_counter_field(target)

    if not field_name:
        return

    if not hasattr(target, field_name):
        logger.warning(
            "Like counter field does not exist: target=%s field=%s",
            target._meta.label_lower,
            field_name,
        )
        return

    queryset = target.__class__.objects.filter(pk=target.pk)

    if delta >= 0:
        queryset.update(**{field_name: F(field_name) + delta})
        return

    queryset.update(**{field_name: Greatest(F(field_name) + delta, 0)})
