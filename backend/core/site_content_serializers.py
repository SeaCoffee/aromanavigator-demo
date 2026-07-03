from rest_framework import serializers

from core.models import (
    FeedbackMessageModel,
    SiteContactSettingsModel,
    SiteFaqModel,
    SitePageModel,
)


class SiteContactSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteContactSettingsModel
        fields = [
            "contact_email",
            "contact_phone",
            "contact_address",
            "support_hours",
            "footer_text",
            "footer_site_links",
            "footer_community_links",
            "footer_market_links",
            "footer_legal_links",
            "instagram_url",
            "facebook_url",
            "telegram_url",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]


class SitePageSerializer(serializers.ModelSerializer):
    slug_label = serializers.CharField(source="get_slug_display", read_only=True)

    class Meta:
        model = SitePageModel
        fields = [
            "id",
            "slug",
            "slug_label",
            "title",
            "body",
            "is_published",
            "updated_at",
        ]
        read_only_fields = ["id", "slug_label", "updated_at"]


class SiteFaqSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteFaqModel
        fields = [
            "id",
            "question",
            "answer",
            "position",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_question(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Р’РєР°Р¶С–С‚СЊ РїРёС‚Р°РЅРЅСЏ.")
        return value

    def validate_answer(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Р’РєР°Р¶С–С‚СЊ РІС–РґРїРѕРІС–РґСЊ.")
        return value


class FeedbackCreateSerializer(serializers.ModelSerializer):
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = FeedbackMessageModel
        fields = ["name", "email", "subject", "message", "source_path", "website"]

    def validate(self, attrs):
        if attrs.pop("website", ""):
            raise serializers.ValidationError({"detail": "РќРµ РІРґР°Р»РѕСЃСЏ РЅР°РґС–СЃР»Р°С‚Рё РїРѕРІС–РґРѕРјР»РµРЅРЅСЏ."})

        for field in ("name", "subject", "message"):
            attrs[field] = attrs[field].strip()

        return attrs


class FeedbackAdminSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True, allow_null=True)

    class Meta:
        model = FeedbackMessageModel
        fields = [
            "id",
            "user",
            "user_email",
            "name",
            "email",
            "subject",
            "message",
            "status",
            "status_label",
            "admin_note",
            "source_path",
            "ip_address",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "user_email",
            "name",
            "email",
            "subject",
            "message",
            "status_label",
            "source_path",
            "ip_address",
            "created_at",
            "updated_at",
        ]


class FeedbackAdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackMessageModel
        fields = ["status", "admin_note"]
