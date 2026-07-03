from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.users.author_display import (
    personal_user_avatar,
    personal_user_display_name,
    personal_user_username,
)
from apps.photos.serializers import ObjectPhotoSerializer
from core.validators.photos_validators import (
    MAX_ATTACHMENTS_PER_UPLOAD,
    validate_uploaded_image_file,
)
from core.serializers.target_reference import TargetReferenceField
from core.validators.comment_validators import (
    validate_comment_body,
    validate_parent_comment,
    validate_target_can_receive_comments,
)

from .models import CommentModel
from .rules import is_comment_target_allowed


REPLY_TO_BODY_PREVIEW_LEN = 180


def _django_error_to_drf(exc: DjangoValidationError):
    if hasattr(exc, "message_dict"):
        return exc.message_dict

    return exc.messages


def _body_preview(value: str, *, max_len: int = REPLY_TO_BODY_PREVIEW_LEN) -> str:
    text = str(value or "").strip()

    if len(text) <= max_len:
        return text

    return f"{text[:max_len].rstrip()}вЂ¦"


def _target_title(target) -> str | None:
    if target is None:
        return None

    for field_name in ("display_name", "title"):
        value = getattr(target, field_name, None)
        if value:
            return str(value)

    brand = getattr(target, "brand_name", None)
    perfume = getattr(target, "perfume_name", None)
    if brand or perfume:
        return " ".join(str(item) for item in (brand, perfume) if item).strip()

    brand_obj = getattr(target, "brand", None)
    name = getattr(target, "name", None)
    brand_name = getattr(brand_obj, "name", None)
    if brand_name or name:
        return str(target)

    return str(target)


class CommentCreateSerializer(serializers.Serializer):
    target = TargetReferenceField(allow_ct=is_comment_target_allowed)
    body = serializers.CharField()
    parent_id = serializers.IntegerField(required=False, allow_null=True)
    is_official = serializers.BooleanField(required=False, default=False)
    images = serializers.ListField(
        child=serializers.ImageField(validators=[validate_uploaded_image_file]),
        required=False,
        allow_empty=True,
        max_length=MAX_ATTACHMENTS_PER_UPLOAD,
        write_only=True,
    )

    def validate_body(self, value: str) -> str:
        try:
            return validate_comment_body(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(_django_error_to_drf(exc))

    def validate(self, attrs):
        target = attrs["target"]
        parent_id = attrs.get("parent_id")

        try:
            validate_target_can_receive_comments(target)
            parent = validate_parent_comment(target, parent_id)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(_django_error_to_drf(exc))

        if parent:
            attrs["parent"] = parent

        request = self.context.get("request")
        if attrs.get("is_official") and not getattr(getattr(request, "user", None), "is_staff", False):
            raise serializers.ValidationError(
                {"is_official": "РџСѓР±Р»С–РєСѓРІР°С‚Рё РІС–Рґ РђРґРјС–РЅС–СЃС‚СЂР°С†С–С— РјРѕР¶СѓС‚СЊ Р»РёС€Рµ СЃРїС–РІСЂРѕР±С–С‚РЅРёРєРё."}
            )

        return attrs


class CommentUpdateSerializer(serializers.Serializer):
    body = serializers.CharField()

    def validate_body(self, value: str) -> str:
        try:
            return validate_comment_body(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(_django_error_to_drf(exc))


class CommentSerializer(serializers.ModelSerializer):
    attachments = serializers.SerializerMethodField()
    reply_to = serializers.SerializerMethodField()
    target = serializers.SerializerMethodField()

    user_username = serializers.SerializerMethodField()
    user_display_name = serializers.SerializerMethodField()
    user_avatar = serializers.SerializerMethodField()
    user_is_staff = serializers.SerializerMethodField()
    user_role_label = serializers.SerializerMethodField()

    is_liked_by_me = serializers.SerializerMethodField()
    my_like_id = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = CommentModel
        fields = [
            "id",
            "user",
            "user_username",
            "user_display_name",
            "user_avatar",
            "user_is_staff",
            "user_role_label",
            "content_type",
            "object_id",
            "target",
            "parent",
            "reply_to",
            "body",
            "is_deleted",
            "likes_count",
            "is_liked_by_me",
            "my_like_id",
            "is_owner",
            "attachments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_attachments(self, obj: CommentModel):
        photos_map = self.context.get("object_photos_map") or {}
        pack = photos_map.get(obj.id) or {}

        return ObjectPhotoSerializer(
            pack.get("attachments") or [],
            many=True,
            context=self.context,
        ).data

    def get_target(self, obj: CommentModel):
        target = getattr(obj, "content_object", None)
        return {
            "app": obj.content_type.app_label,
            "model": obj.content_type.model,
            "id": obj.object_id,
            "title": _target_title(target),
            "slug": getattr(target, "slug", None) if target is not None else None,
        }

    def _user(self, obj: CommentModel):
        return getattr(obj, "user", None)

    def get_user_username(self, obj: CommentModel):
        if obj.is_official:
            return None
        return personal_user_username(self._user(obj))

    def get_user_display_name(self, obj: CommentModel):
        if obj.is_official:
            return "РђРґРјС–РЅС–СЃС‚СЂР°С†С–СЏ"
        return personal_user_display_name(self._user(obj))

    def get_user_avatar(self, obj: CommentModel):
        if obj.is_official:
            return None
        return personal_user_avatar(self._user(obj))

    def get_user_is_staff(self, obj: CommentModel) -> bool:
        return obj.is_official

    def get_user_role_label(self, obj: CommentModel):
        return "РњРѕРґРµСЂР°С†С–СЏ" if obj.is_official else None

    def get_reply_to(self, obj: CommentModel):
        parent = getattr(obj, "parent", None)

        if not parent:
            return None

        parent_user = getattr(parent, "user", None)
        parent_official = bool(parent.is_official)
        parent_username = None if parent_official else personal_user_username(parent_user)
        parent_display_name = (
            "РђРґРјС–РЅС–СЃС‚СЂР°С†С–СЏ" if parent_official else personal_user_display_name(parent_user)
        )
        parent_avatar = None if parent_official else personal_user_avatar(parent_user)
        parent_is_staff = parent_official
        parent_role_label = "РњРѕРґРµСЂР°С†С–СЏ" if parent_official else None

        if parent.is_deleted:
            return {
                "id": parent.id,
                "is_deleted": True,
                "user": parent.user_id,
                "user_username": parent_username,
                "user_display_name": parent_display_name,
                "user_avatar": parent_avatar,
                "user_is_staff": parent_is_staff,
                "user_role_label": parent_role_label,
                "body_preview": None,
            }

        return {
            "id": parent.id,
            "is_deleted": False,
            "user": parent.user_id,
            "user_username": parent_username,
            "user_display_name": parent_display_name,
            "user_avatar": parent_avatar,
            "user_is_staff": parent_is_staff,
            "user_role_label": parent_role_label,
            "body_preview": _body_preview(parent.body),
        }

    def get_is_liked_by_me(self, obj: CommentModel) -> bool:
        liked_ids = self.context.get("liked_comment_ids") or set()
        return obj.id in liked_ids

    def get_my_like_id(self, obj: CommentModel):
        likes_map = self.context.get("comment_my_likes_map") or {}
        return likes_map.get(obj.id)

    def get_is_owner(self, obj: CommentModel) -> bool:
        request = self.context.get("request")
        user = getattr(request, "user", None)

        return bool(
            user
            and getattr(user, "is_authenticated", False)
            and obj.user_id == user.id
        )


class CommentThreadSerializer(CommentSerializer):
    replies = serializers.SerializerMethodField()

    class Meta(CommentSerializer.Meta):
        fields = [
            "id",
            "user",
            "user_username",
            "user_display_name",
            "user_avatar",
            "user_is_staff",
            "user_role_label",
            "target",
            "body",
            "is_deleted",
            "likes_count",
            "is_liked_by_me",
            "my_like_id",
            "is_owner",
            "attachments",
            "created_at",
            "updated_at",
            "parent",
            "replies",
        ]
        read_only_fields = fields

    def get_replies(self, obj: CommentModel):
        replies = getattr(obj, "prefetched_replies", None)

        if replies is None:
            replies = (
                obj.replies
                .filter(is_deleted=False)
                .select_related(
                    "user",
                    "user__profile",
                    "parent",
                    "parent__user",
                    "parent__user__profile",
                )
                .order_by("created_at", "id")
            )

        return CommentThreadSerializer(
            replies,
            many=True,
            context=self.context,
        ).data
