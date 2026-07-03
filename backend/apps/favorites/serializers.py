from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.favorites.availability import get_favorite_unavailable_reason
from apps.favorites.models import PerfumeFavoriteModel
from core.validators.favorite_validators import (
    favorite_exists,
    parse_favorite_target,
    validate_target_can_be_favorited,
    validation_message,
)
from core.perfume_map.serializers_map import SERIALIZER_MAP


class PerfumeFavoriteTargetSerializer(serializers.Serializer):
    target = serializers.DictField(write_only=True)

    def validate_target(self, value):
        try:
            return parse_favorite_target(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(validation_message(exc))


class PerfumeFavoriteCreateSerializer(PerfumeFavoriteTargetSerializer):
    """
    РќРµ РїСЂРѕРІРµСЂСЏРµРј validate_favorite_not_exists(),
    РїРѕС‚РѕРјСѓ С‡С‚Рѕ add_to_favorites() РёРґРµРјРїРѕС‚РµРЅС‚РЅС‹Р№:
    РЅРѕРІС‹Р№ favorite -> 201,
    СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёР№ favorite -> 200.
    """

    def validate(self, attrs):
        user = self.context["request"].user
        target = attrs["target"]

        try:
            validate_target_can_be_favorited(user=user, target=target)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(validation_message(exc))

        return attrs


class PerfumeFavoriteToggleInputSerializer(PerfumeFavoriteTargetSerializer):
    """
    Toggle РґРѕР»Р¶РµРЅ РїРѕР·РІРѕР»СЏС‚СЊ СѓРґР°Р»РёС‚СЊ СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓСЋС‰РёР№ favorite РґР°Р¶Рµ РµСЃР»Рё РѕР±СЉРµРєС‚
    СЃС‚Р°Р» hidden/blocked. РќРѕ РµСЃР»Рё favorite РµС‰С‘ РЅРµС‚ вЂ” РґРѕР±Р°РІР»РµРЅРёРµ РїСЂРѕРІРµСЂСЏРµРј.
    """

    def validate(self, attrs):
        user = self.context["request"].user
        target = attrs["target"]

        if favorite_exists(user=user, target=target):
            return attrs

        try:
            validate_target_can_be_favorited(user=user, target=target)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(validation_message(exc))

        return attrs


class PerfumeFavoriteSerializer(serializers.ModelSerializer):
    item = serializers.SerializerMethodField()

    class Meta:
        model = PerfumeFavoriteModel
        fields = [
            "id",
            "created_at",
            "item",
        ]

    def get_item(self, obj: PerfumeFavoriteModel):
        target = obj.content_object

        if target is None:
            return {
                "app": obj.content_type.app_label,
                "model": obj.content_type.model,
                "id": obj.object_id,
                "is_available": False,
                "unavailable_reason": "deleted",
            }

        request = self.context.get("request")
        user = getattr(request, "user", None)

        meta = target._meta

        unavailable_reason = get_favorite_unavailable_reason(target, user)

        if unavailable_reason:
            return {
                "app": meta.app_label,
                "model": meta.model_name,
                "id": target.pk,
                "is_available": False,
                "unavailable_reason": unavailable_reason,
            }

        serializer_class = SERIALIZER_MAP.get(type(target))

        if serializer_class:
            data = dict(serializer_class(target, context=self.context).data)
            data["is_available"] = True
            return data

        return {
            "app": meta.app_label,
            "model": meta.model_name,
            "id": target.pk,
            "is_available": True,
        }


class PerfumeFavoriteToggleResponseSerializer(serializers.Serializer):
    favorited = serializers.BooleanField()
    favorite = PerfumeFavoriteSerializer(allow_null=True)
