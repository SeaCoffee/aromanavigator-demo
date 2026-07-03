from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import LikeModel
from core.validators.likes_validators import parse_like_target, validation_message


class LikeTargetSerializer(serializers.Serializer):
    target = serializers.DictField(write_only=True)

    def validate_target(self, value):
        try:
            return parse_like_target(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(validation_message(exc))


class LikeCreateSerializer(LikeTargetSerializer):
    """
    РћС‚РґРµР»СЊРЅС‹Р№ РєР»Р°СЃСЃ РѕСЃС‚Р°РІР»СЏРµРј РґР»СЏ СЏРІРЅРѕРіРѕ API-РєРѕРЅС‚СЂР°РєС‚Р°.

    РќРµ РїСЂРѕРІРµСЂСЏРµРј Р·РґРµСЃСЊ СЃСѓС‰РµСЃС‚РІРѕРІР°РЅРёРµ Р»Р°Р№РєР°:
    СЃРµСЂРІРёСЃ РґРµР»Р°РµС‚ idempotent create Рё РІРѕР·РІСЂР°С‰Р°РµС‚ 200, РµСЃР»Рё Р»Р°Р№Рє СѓР¶Рµ Р±С‹Р».
    """

    pass


class LikeSerializer(serializers.ModelSerializer):
    item = serializers.SerializerMethodField()

    class Meta:
        model = LikeModel
        fields = [
            "id",
            "created_at",
            "item",
        ]
        read_only_fields = fields

    def get_item(self, obj: LikeModel):
        targets_map = self.context.get("like_targets_map") or {}

        target = targets_map.get((obj.content_type_id, obj.object_id))

        if target is None:
            target = obj.content_object

        if target is None:
            return None

        meta = target._meta

        title = (
            getattr(target, "title", None)
            or getattr(target, "name", None)
            or getattr(target, "display_name", None)
            or ""
        )

        return {
            "app": meta.app_label,
            "model": meta.model_name,
            "id": target.pk,
            "title": title,
        }


class LikeToggleSerializer(serializers.Serializer):
    liked = serializers.BooleanField()
    like = LikeSerializer(allow_null=True)
