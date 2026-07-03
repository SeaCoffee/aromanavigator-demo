from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.users.models import ProfileModel, UserModel, UserStatsModel
from apps.users.avatar_selectors import profile_avatar_url
from apps.users.author_display import (
    personal_user_display_name,
    personal_user_username,
)
from apps.users.user_role_service import UserRoleService
from core.validators.password_validator import validate_password
from core.validators.profile_validators import (
    validate_display_name,
    validate_name,
)
from core.validators.suspension_validators import (
    normalize_suspension_until,
    validate_suspension_payload,
)
from core.validators.user_validators import (
    validate_unique_display_name,
    validate_unique_user_email,
)
from core.choises.region_choise import RegionChoices


def django_validation_to_drf_error(exc: DjangoValidationError):
    if hasattr(exc, "message_dict"):
        raise serializers.ValidationError(exc.message_dict)

    raise serializers.ValidationError(exc.messages)


class ProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(validators=[validate_name])
    display_name = serializers.CharField()

    class Meta:
        model = ProfileModel
        fields = (
            "id",
            "name",
            "display_name",
            "created_at",
            "updated_at",
            "region",
            "user",
            "about_me",
        )
        read_only_fields = (
            "id",
            "user",
            "created_at",
            "updated_at",
        )

    def validate_display_name(self, value: str) -> str:
        exclude_profile_id = self.instance.id if self.instance else None

        try:
            return validate_unique_display_name(
                value,
                exclude_profile_id=exclude_profile_id,
            )
        except DjangoValidationError as exc:
            django_validation_to_drf_error(exc)


class RegisterProfileSerializer(serializers.Serializer):
    name = serializers.CharField(validators=[validate_name])
    display_name = serializers.CharField(validators=[validate_display_name])
    region = serializers.ChoiceField(
        choices=RegionChoices.choices,
        required=False,
    )


class ProfileUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(
        required=False,
        validators=[validate_name],
    )
    display_name = serializers.CharField(
        required=False,
        validators=[validate_display_name],
    )
    region = serializers.ChoiceField(
    choices=RegionChoices.choices,
    required=False,
)
    about_me = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )


class UserSelfUpdateSerializer(serializers.Serializer):
    profile = ProfileUpdateSerializer(required=True)


class UserStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStatsModel
        fields = (
            "followers_count",
            "following_count",
            "notifications_unread_count",
            "messages_unread_count",
            "forum_topics_count",
            "forum_comments_count",
            "likes_given_count",
            "likes_received_count",
            "started_at",
        )
        read_only_fields = fields


class PublicUserStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStatsModel
        fields = (
            "followers_count",
            "following_count",
            "forum_topics_count",
            "forum_comments_count",
            "likes_given_count",
            "likes_received_count",
            "started_at",
        )
        read_only_fields = fields


class UserRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=120)
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
    )
    profile = RegisterProfileSerializer()
    terms_accepted = serializers.BooleanField(write_only=True)

    def validate_email(self, value: str) -> str:
        return validate_unique_user_email(value, allow_unverified_pending=True)

    def validate_terms_accepted(self, value: bool) -> bool:
        if value is not True:
            raise serializers.ValidationError(
                "РџРѕС‚СЂС–Р±РЅРѕ РїРѕРіРѕРґРёС‚РёСЃСЏ Р· РїСЂР°РІРёР»Р°РјРё РєРѕСЂРёСЃС‚СѓРІР°РЅРЅСЏ С‚Р° РїРѕР»С–С‚РёРєРѕСЋ РєРѕРЅС„С–РґРµРЅС†С–Р№РЅРѕСЃС‚С–."
            )
        return value


class SuspendSerializer(serializers.Serializer):
    until = serializers.DateTimeField(required=False, allow_null=True)
    permanent = serializers.BooleanField(required=False, default=False)
    reason = serializers.CharField(
        allow_blank=True,
        required=False,
        max_length=255,
    )

    def validate_until(self, value):
        return normalize_suspension_until(value)

    def validate(self, attrs):
        return validate_suspension_payload(attrs)


class ProfileMeSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    display_name = serializers.CharField(read_only=True)

    class Meta:
        model = ProfileModel
        fields = (
            "id",
            "name",
            "display_name",
            "region",
            "avatar_url",
            "about_me",
        )
        read_only_fields = fields

    def get_avatar_url(self, obj):
        return profile_avatar_url(obj)


class UserMeSerializer(serializers.ModelSerializer):
    profile = ProfileMeSerializer(read_only=True)
    stats = UserStatsSerializer(read_only=True)

    is_suspended = serializers.SerializerMethodField()
    suspension_seconds_left = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    is_seller = serializers.BooleanField(read_only=True)
    has_password = serializers.SerializerMethodField()

    class Meta:
        model = UserModel
        fields = (
            "id",
            "email",
            "email_verified",
            "is_active",
            "is_staff",
            "is_superuser",
            "role",
            "is_seller",
            "account_type",
            "profile",
            "stats",
            "is_suspended",
            "suspended_until",
            "suspended_indefinitely",
            "suspension_seconds_left",
            "has_password",
        )
        read_only_fields = fields

    def get_is_suspended(self, obj) -> bool:
        return obj.is_suspended

    def get_suspension_seconds_left(self, obj) -> int | None:
        return obj.suspension_seconds_left

    def get_role(self, obj) -> str:
        return UserRoleService.get_role(obj)

    def get_has_password(self, obj) -> bool:
        return obj.has_usable_password()


class UserAdminSerializer(serializers.ModelSerializer):
    profile = ProfileMeSerializer(read_only=True)
    stats = UserStatsSerializer(read_only=True)

    role = serializers.SerializerMethodField()
    is_suspended = serializers.SerializerMethodField()
    suspension_seconds_left = serializers.SerializerMethodField()

    class Meta:
        model = UserModel
        fields = (
            "id",
            "email",
            "email_verified",
            "is_active",
            "is_staff",
            "is_superuser",
            "role",
            "is_seller",
            "account_type",
            "is_upgrade_to_premium",
            "last_login",
            "last_logout",
            "profile",
            "stats",
            "suspended_until",
            "suspended_indefinitely",
            "suspended_reason",
            "is_suspended",
            "suspension_seconds_left",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def get_role(self, obj) -> str:
        return UserRoleService.get_role(obj)

    def get_is_suspended(self, obj) -> bool:
        return obj.is_suspended

    def get_suspension_seconds_left(self, obj) -> int | None:
        return obj.suspension_seconds_left


class UserPublicSerializer(serializers.ModelSerializer):
    profile = ProfileMeSerializer(read_only=True, allow_null=True)
    stats = PublicUserStatsSerializer(read_only=True)

    class Meta:
        model = UserModel
        fields = (
            "id",
            "profile",
            "stats",
        )
        read_only_fields = fields


class PublicUserSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    username = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()

    def get_username(self, obj) -> str | None:
        return personal_user_username(obj)

    def get_display_name(self, obj) -> str:
        return personal_user_display_name(obj) or "РљРѕСЂРёСЃС‚СѓРІР°С‡"


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )
    new_password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        validators=[validate_password],
    )

    def validate(self, attrs):
        if attrs["old_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {
                    "new_password": [
                        "РќРѕРІРёР№ РїР°СЂРѕР»СЊ РјР°С” РІС–РґСЂС–Р·РЅСЏС‚РёСЃСЏ РІС–Рґ РїРѕС‚РѕС‡РЅРѕРіРѕ."
                    ]
                }
            )

        return attrs
