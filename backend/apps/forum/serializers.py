from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers


from apps.users.author_display import (
    is_staff_public_author,
    public_user_avatar,
    public_user_display_name,
    public_user_username,
    public_user_role_label,
)

from apps.photos.serializers import ObjectCoverSerializer, ObjectPhotoSerializer
from apps.tags.services import parse_extra_tags
from core.validators.forum_validators import (
    validate_section_title,
    validate_staff_only_topic_fields,
    validate_topic_content,
    validate_topic_title,
)

from .models import ForumSectionModel, ForumTopicModel


class ForumSectionSerializer(serializers.ModelSerializer):
    cover = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()

    class Meta:
        model = ForumSectionModel
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "is_active",
            "order",
            "topics_count",
            "comments_count",
            "cover",
            "attachments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "slug",
            "topics_count",
            "comments_count",
            "cover",
            "attachments",
            "created_at",
            "updated_at",
        ]

    def validate_title(self, value: str) -> str:
        return validate_section_title(value)

    def _bucket(self, obj: ForumSectionModel) -> dict:
        photos_map = self.context.get("object_photos_map") or {}
        return photos_map.get(obj.id) or {"cover": None, "attachments": []}

    def get_cover(self, obj: ForumSectionModel):
        cover = self._bucket(obj).get("cover")
        return ObjectCoverSerializer(cover, context=self.context).data if cover else None

    def get_attachments(self, obj: ForumSectionModel):
        photos = self._bucket(obj).get("attachments") or []
        return ObjectPhotoSerializer(photos, many=True, context=self.context).data


class ForumTopicSerializer(serializers.ModelSerializer):
    cover = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()

    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True,
    )
    tags_read = serializers.SerializerMethodField(read_only=True)

    author_username = serializers.SerializerMethodField(read_only=True)
    author_display_name = serializers.SerializerMethodField(read_only=True)
    author_avatar = serializers.SerializerMethodField(read_only=True)
    author_is_staff = serializers.SerializerMethodField(read_only=True)
    author_role_label = serializers.SerializerMethodField(read_only=True)

    section_title = serializers.CharField(source="section.title", read_only=True)
    section_slug = serializers.CharField(source="section.slug", read_only=True)

    is_liked_by_me = serializers.SerializerMethodField(read_only=True)
    my_like_id = serializers.SerializerMethodField(read_only=True)
    is_owner = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ForumTopicModel
        fields = [
            "id",
            "section",
            "author",
            "author_username",
            "author_display_name",
            "author_avatar",
            "author_is_staff",
            "author_role_label",
            "section_title",
            "section_slug",
            "title",
            "slug",
            "content",
            "is_pinned",
            "is_locked",
            "is_hidden",
            "comments_count",
            "likes_count",
            "views_count",
            "last_activity_at",
            "cover",
            "attachments",
            "tags",
            "tags_read",
            "is_liked_by_me",
            "my_like_id",
            "is_owner",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "author",
            "author_username",
            "author_display_name",
            "author_avatar",
            "author_is_staff",
            "author_role_label",
            "slug",
            "comments_count",
            "likes_count",
            "views_count",
            "last_activity_at",
            "cover",
            "attachments",
            "section_title",
            "section_slug",
            "tags_read",
            "is_liked_by_me",
            "my_like_id",
            "is_owner",
            "created_at",
            "updated_at",
        ]

    def validate_title(self, value: str) -> str:
        return validate_topic_title(value)

    def validate_content(self, value: str) -> str:
        return validate_topic_content(value)

    def validate_tags(self, value):
        try:
            return parse_extra_tags(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages)

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        try:
            validate_staff_only_topic_fields(
                user=user,
                raw_data=dict(getattr(self, "initial_data", {}) or {}),
            )
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                exc.message_dict if hasattr(exc, "message_dict") else exc.messages
            )

        return attrs

    def get_is_owner(self, obj: ForumTopicModel) -> bool:
        request = self.context.get("request")
        user = getattr(request, "user", None)

        return bool(
            user
            and getattr(user, "is_authenticated", False)
            and obj.author_id == user.id
        )

    def get_is_liked_by_me(self, obj: ForumTopicModel) -> bool:
        liked_ids = self.context.get("liked_topic_ids") or set()
        return obj.id in liked_ids

    def get_my_like_id(self, obj: ForumTopicModel):
        likes_map = self.context.get("topic_my_likes_map") or {}
        return likes_map.get(obj.id)

    def _bucket(self, obj: ForumTopicModel) -> dict:
        photos_map = self.context.get("object_photos_map") or {}
        return photos_map.get(obj.id) or {"cover": None, "attachments": []}

    def get_cover(self, obj: ForumTopicModel):
        cover = self._bucket(obj).get("cover")
        return ObjectCoverSerializer(cover, context=self.context).data if cover else None

    def get_attachments(self, obj: ForumTopicModel):
        photos = self._bucket(obj).get("attachments") or []
        return ObjectPhotoSerializer(photos, many=True, context=self.context).data

    def _author_user(self, obj: ForumTopicModel):
        return getattr(obj, "author", None)

    def _author_user(self, obj: ForumTopicModel):
        return getattr(obj, "author", None)

    def get_author_username(self, obj: ForumTopicModel):
        return public_user_username(self._author_user(obj))

    def get_author_display_name(self, obj: ForumTopicModel):
        return public_user_display_name(self._author_user(obj))

    def get_author_avatar(self, obj: ForumTopicModel):
        return public_user_avatar(
            self._author_user(obj),
            request=self.context.get("request"),
        )

    def get_author_is_staff(self, obj: ForumTopicModel) -> bool:
        return is_staff_public_author(self._author_user(obj))

    def get_author_role_label(self, obj: ForumTopicModel):
        return public_user_role_label(self._author_user(obj))

    def get_tags_read(self, obj: ForumTopicModel):
        tags_map = self.context.get("topic_tags_map") or {}
        return tags_map.get(obj.id, [])
