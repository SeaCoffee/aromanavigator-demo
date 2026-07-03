from django.utils import timezone
from rest_framework.exceptions import ValidationError


MIN_PERFUME_RELEASE_YEAR = 1920


def validate_perfume_year_or_decade(
    *,
    value,
    field_name: str = "year_or_decade",
) -> None:
    if value in (None, ""):
        return

    try:
        year = int(value)
    except (TypeError, ValueError):
        raise ValidationError({
            field_name: "Р С–Рє Р°Р±Рѕ РґРµСЃСЏС‚РёР»С–С‚С‚СЏ РјР°С” Р±СѓС‚Рё С‡РёСЃР»РѕРј."
        })

    current_year = timezone.localdate().year

    if year < MIN_PERFUME_RELEASE_YEAR:
        raise ValidationError({
            field_name: (
                f"Р С–Рє Р°Р±Рѕ РґРµСЃСЏС‚РёР»С–С‚С‚СЏ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё СЂР°РЅС–С€Рµ "
                f"{MIN_PERFUME_RELEASE_YEAR} СЂРѕРєСѓ."
            )
        })

    if year > current_year:
        raise ValidationError({
            field_name: (
                f"Р С–Рє Р°Р±Рѕ РґРµСЃСЏС‚РёР»С–С‚С‚СЏ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё РїС–Р·РЅС–С€Рµ "
                f"{current_year} СЂРѕРєСѓ."
            )
        })
