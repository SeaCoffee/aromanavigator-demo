from __future__ import annotations

from datetime import date, datetime, time

from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from rest_framework.exceptions import ValidationError


def normalize_suspension_until(value):
    if value in (None, ""):
        return None

    if isinstance(value, datetime):
        result = value
    elif isinstance(value, date):
        result = datetime.combine(value, time.max)
    elif isinstance(value, str):
        parsed_datetime = parse_datetime(value)

        if parsed_datetime is not None:
            result = parsed_datetime
        else:
            parsed_date = parse_date(value)

            if parsed_date is None:
                raise ValidationError(
                    {"until": "РќРµРєРѕСЂРµРєС‚РЅР° РґР°С‚Р° Р°Р±Рѕ С‡Р°СЃ Р·Р°РІРµСЂС€РµРЅРЅСЏ Р±Р»РѕРєСѓРІР°РЅРЅСЏ."}
                )

            result = datetime.combine(parsed_date, time.max)
    else:
        raise ValidationError(
            {"until": "РќРµРєРѕСЂРµРєС‚РЅР° РґР°С‚Р° Р°Р±Рѕ С‡Р°СЃ Р·Р°РІРµСЂС€РµРЅРЅСЏ Р±Р»РѕРєСѓРІР°РЅРЅСЏ."}
        )

    if timezone.is_naive(result):
        result = timezone.make_aware(result, timezone.get_current_timezone())

    return result


def validate_suspension_payload(attrs: dict) -> dict:
    permanent = bool(attrs.get("permanent", False))
    until = attrs.get("until")

    if permanent:
        attrs["until"] = None
        return attrs

    if until is None:
        raise ValidationError(
            {
                "until": (
                    "Р’РєР°Р¶С–С‚СЊ РґР°С‚Сѓ/С‡Р°СЃ Р·Р°РІРµСЂС€РµРЅРЅСЏ Р±Р»РѕРєСѓРІР°РЅРЅСЏ "
                    "Р°Р±Рѕ permanent=true."
                )
            }
        )

    normalized_until = normalize_suspension_until(until)

    if normalized_until <= timezone.now():
        raise ValidationError(
            {"until": "Р”Р°С‚Р° Р·Р°РІРµСЂС€РµРЅРЅСЏ РјР°С” Р±СѓС‚Рё РІ РјР°Р№Р±СѓС‚РЅСЊРѕРјСѓ."}
        )

    attrs["until"] = normalized_until
    return attrs
