import re

from rest_framework import serializers

from apps.articles.models import Article, Tag
from apps.users.author_display import public_user_avatar, public_user_display_name
from core.validators.article_validators import (
    validate_article_content,
    validate_article_title,
    validate_author_article_status,
    validate_moderator_comment,
    validate_tag_name,
    validate_tag_names,
)
from core.choises.article_status_choise import ArticleStatus
from apps.photos.serializers import ObjectCoverSerializer, ObjectPhotoSerializer

ARTICLE_PHOTO_TOKEN_RE = re.compile(r"\[\[(?:article-photo|article-upload):\d+\]\]")

def article_photos_for(serializer, obj) -> dict:
    photos_map = serializer.context.get("object_photos_map") or {}

    return photos_map.get(obj.id) or {}


class TagSerializer(serializers.ModelSerializer):
    name = serializers.CharField(max_length=50, validators=[validate_tag_name])

    class Meta:
        model = Tag
        fields = (
            "id",
            "name",
        )
        read_only_fields = (
            "id",
        )


class ArticleAuthorSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    display_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    def get_display_name(self, obj) -> str:
        return public_user_display_name(obj) or "РљРѕСЂРёСЃС‚СѓРІР°С‡"

    def get_avatar_url(self, obj) -> str:
        return public_user_avatar(obj) or ""


class ArticleListSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    author = ArticleAuthorSerializer(read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    excerpt = serializers.SerializerMethodField()
    cover = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = (
            "id",
            "title",
            "excerpt",
            "status",
            "status_label",
            "author",
            "tags",
            "cover",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_excerpt(self, obj) -> str:
        content = ARTICLE_PHOTO_TOKEN_RE.sub(" ", obj.content or "")
        content = " ".join(content.split())

        if len(content) <= 220:
            return content

        return f"{content[:220].rstrip()}..."

    def get_cover(self, obj):
        cover = article_photos_for(self, obj).get("cover")

        if not cover:
            return None

        return ObjectCoverSerializer(
            cover,
            context=self.context,
        ).data

class ArticleDetailSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    author = ArticleAuthorSerializer(read_only=True)
    author_id = serializers.IntegerField(source="author.id", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    cover = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = (
            "id",
            "title",
            "content",
            "status",
            "status_label",
            "moderator_comment",
            "author",
            "author_id",
            "tags",
            "cover",
            "attachments",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_cover(self, obj):
        cover = article_photos_for(self, obj).get("cover")

        if not cover:
            return None

        return ObjectCoverSerializer(
            cover,
            context=self.context,
        ).data

    def get_attachments(self, obj):
        attachments = article_photos_for(self, obj).get("attachments") or []

        return ObjectPhotoSerializer(
            attachments,
            many=True,
            context=self.context,
        ).data


class ArticleCreateUpdateSerializer(serializers.Serializer):
    title = serializers.CharField(
        max_length=200,
        required=True,
        validators=[validate_article_title],
    )
    content = serializers.CharField(
        required=True,
        validators=[validate_article_content],
    )
    tag_names = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False,
        allow_empty=True,
        write_only=True,
    )
    status = serializers.ChoiceField(
        choices=ArticleStatus.choices,
        required=False,
        default=ArticleStatus.DRAFT,
        validators=[validate_author_article_status],
    )

    def validate_tag_names(self, value):
        return validate_tag_names(value)

    def validate(self, attrs):
        if self.partial and not attrs:
            raise serializers.ValidationError("РќРµРјР°С” РґР°РЅРёС… РґР»СЏ РѕРЅРѕРІР»РµРЅРЅСЏ.")

        return attrs


class ArticleRejectSerializer(serializers.Serializer):
    moderator_comment = serializers.CharField(
        required=False,
        allow_blank=True,
        validators=[validate_moderator_comment],
    )
