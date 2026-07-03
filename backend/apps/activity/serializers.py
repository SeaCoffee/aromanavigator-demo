from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.activity.models import ActivityEventModel
from apps.users.author_display import public_user_avatar, public_user_display_name
from core.choises.activity_choises import ActivityVerb
from core.validators.activity_validators import (
    normalize_activity_triplet,
    validate_activity_payload,
    validate_activity_verb,
    validation_message,
)


# apps/activity/serializers.py

class ActivityActorSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    display_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    def get_display_name(self, obj) -> str:
        return public_user_display_name(obj) or f"User #{obj.pk}"

    def get_avatar_url(self, obj):
        return public_user_avatar(obj)


class ActivityTargetSerializer(serializers.Serializer):
    app = serializers.CharField()
    model = serializers.CharField()
    id = serializers.IntegerField()


class ActivityEventSerializer(serializers.ModelSerializer):
    actor = ActivityActorSerializer(read_only=True)
    target = serializers.SerializerMethodField()

    class Meta:
        model = ActivityEventModel
        fields = [
            "id",
            "actor",
            "verb",
            "target",
            "target_app",
            "target_model",
            "target_id",
            "payload",
            "is_private",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_target(self, obj):
        if not obj.target_app or not obj.target_model or not obj.target_id:
            return None

        return {
            "app": obj.target_app,
            "model": obj.target_model,
            "id": obj.target_id,
        }


class ActivityCreateSerializer(serializers.Serializer):
    """
    РќРµ РґР»СЏ РѕР±С‹С‡РЅРѕРіРѕ frontend.
    РњРѕР¶РЅРѕ РѕСЃС‚Р°РІРёС‚СЊ С‚РѕР»СЊРєРѕ РґР»СЏ staff/debug, РµСЃР»Рё РѕС‡РµРЅСЊ РЅСѓР¶РЅРѕ.
    """
    verb = serializers.ChoiceField(choices=ActivityVerb.choices)
    target_app = serializers.CharField(required=False, allow_blank=True)
    target_model = serializers.CharField(required=False, allow_blank=True)
    target_id = serializers.IntegerField(required=False, allow_null=True)
    payload = serializers.JSONField(required=False)
    is_private = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs):
        try:
            verb = validate_activity_verb(attrs.get("verb"))
            payload = validate_activity_payload(attrs.get("payload", {}))

            target_app, target_model, target_id = normalize_activity_triplet(
                target_app=attrs.get("target_app", ""),
                target_model=attrs.get("target_model", ""),
                target_id=attrs.get("target_id"),
            )

        except DjangoValidationError as exc:
            raise serializers.ValidationError(validation_message(exc))

        attrs["verb"] = verb
        attrs["payload"] = payload
        attrs["target_app"] = target_app
        attrs["target_model"] = target_model
        attrs["target_id"] = target_id

        return attrs
