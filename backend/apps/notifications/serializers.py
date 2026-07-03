# apps/notifications/serializers.py

from rest_framework import serializers

from apps.comments.models import CommentModel
from apps.notifications.models import (
    NotificationAnnouncementKind,
    NotificationAnnouncementModel,
    NotificationModel,
)
from apps.users.author_display import personal_user_avatar, personal_user_display_name


class NotificationRefSerializer(serializers.Serializer):
    type = serializers.CharField()
    app = serializers.CharField()
    model = serializers.CharField()
    id = serializers.IntegerField()
    display_name = serializers.CharField(required=False, allow_blank=True)
    avatar_url = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    is_available = serializers.BooleanField(required=False)


class NotificationSerializer(serializers.ModelSerializer):
    actor = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()
    payload = serializers.SerializerMethodField()

    class Meta:
        model = NotificationModel
        fields = [
            "id",
            "actor",
            "verb",
            "target",
            "payload",
            "is_read",
            "read_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def _user_ref_extra(self, user, fallback_id: int) -> dict:
        return {
            "display_name": personal_user_display_name(user) or f"User #{fallback_id}",
            "avatar_url": personal_user_avatar(user),
        }

    def _ref_data(self, *, ct, object_id: int, obj) -> dict:
        data = {
            "type": f"{ct.app_label}.{ct.model}",
            "app": ct.app_label,
            "model": ct.model,
            "id": object_id,
            "is_available": obj is not None,
        }

        if ct.app_label == "users" and ct.model == "usermodel":
            data.update(self._user_ref_extra(obj, object_id))
            data["is_available"] = bool(
                obj
                and obj.is_active
                and not obj.deleted_at
            )

        return data

    def get_actor(self, obj):
        if not obj.actor_ct_id or not obj.actor_id:
            return None

        return self._ref_data(
            ct=obj.actor_ct,
            object_id=obj.actor_id,
            obj=obj.actor,
        )

    def get_target(self, obj):
        if not obj.target_ct_id or not obj.target_id:
            return None

        return self._ref_data(
            ct=obj.target_ct,
            object_id=obj.target_id,
            obj=obj.target,
        )

    def get_payload(self, obj):
        payload = dict(obj.payload or {})
        target = obj.target
        if isinstance(target, CommentModel):
            comment_target = target.content_object
            payload["comment_id"] = target.id
            payload["comment_target"] = {
                "app": target.content_type.app_label,
                "model": target.content_type.model,
                "id": target.object_id,
                "slug": (
                    getattr(comment_target, "slug", None)
                    if comment_target is not None
                    else None
                ),
            }

        return payload


class NotificationUnreadCountSerializer(serializers.Serializer):
    unread_count = serializers.IntegerField()


class NotificationAnnouncementSerializer(serializers.ModelSerializer):
    kind_label = serializers.CharField(source="get_kind_display", read_only=True)
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = NotificationAnnouncementModel
        fields = [
            "id",
            "kind",
            "kind_label",
            "title",
            "body",
            "is_active",
            "is_read",
            "starts_at",
            "ends_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_is_read(self, obj) -> bool:
        return bool(getattr(obj, "is_read", False))


class NotificationAnnouncementInputSerializer(serializers.ModelSerializer):
    kind = serializers.ChoiceField(
        choices=NotificationAnnouncementKind.choices,
        required=False,
    )

    class Meta:
        model = NotificationAnnouncementModel
        fields = [
            "kind",
            "title",
            "body",
            "is_active",
            "starts_at",
            "ends_at",
        ]

    def validate_title(self, value: str) -> str:
        clean = (value or "").strip()

        if not clean:
            raise serializers.ValidationError("РџРѕС‚СЂС–Р±РµРЅ Р·Р°РіРѕР»РѕРІРѕРє РѕРіРѕР»РѕС€РµРЅРЅСЏ.")

        return clean

    def validate_body(self, value: str) -> str:
        clean = (value or "").strip()

        if not clean:
            raise serializers.ValidationError("РџРѕС‚СЂС–Р±РµРЅ С‚РµРєСЃС‚ РѕРіРѕР»РѕС€РµРЅРЅСЏ.")

        return clean

    def validate(self, attrs):
        starts_at = attrs.get("starts_at", getattr(self.instance, "starts_at", None))
        ends_at = attrs.get("ends_at", getattr(self.instance, "ends_at", None))

        if starts_at and ends_at and ends_at < starts_at:
            raise serializers.ValidationError(
                {"ends_at": "Р”Р°С‚Р° Р·Р°РІРµСЂС€РµРЅРЅСЏ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё СЂР°РЅС–С€Рµ СЃС‚Р°СЂС‚Сѓ."}
            )

        return attrs
