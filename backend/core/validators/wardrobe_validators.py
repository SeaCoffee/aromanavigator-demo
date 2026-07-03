from rest_framework import serializers


def validate_rating_1_10(value):
    if value is None:
        return value

    try:
        rating = int(value)
    except (TypeError, ValueError):
        raise serializers.ValidationError("РћС†С–РЅРєР° РјР°С” Р±СѓС‚Рё С‡РёСЃР»РѕРј РІС–Рґ 1 РґРѕ 10 Р°Р±Рѕ null.")

    if not 1 <= rating <= 10:
        raise serializers.ValidationError("РћС†С–РЅРєР° РјР°С” Р±СѓС‚Рё РІС–Рґ 1 РґРѕ 10.")

    return rating
