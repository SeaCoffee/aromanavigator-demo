from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)

from core.common_services.jwt_service import JWTService
from core.validators.password_validator import validate_password


UserModel = get_user_model()


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordSerializer(serializers.Serializer):
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        validators=[validate_password],
    )


class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField(required=False, allow_blank=True)


class SafeTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        try:
            return super().validate(attrs)
        except UserModel.DoesNotExist:
            raise AuthenticationFailed(
                "РЎРµСЃС–СЏ Р±С–Р»СЊС€Рµ РЅРµ РґС–Р№СЃРЅР°. РЈРІС–Р№РґС–С‚СЊ Р·РЅРѕРІСѓ.",
                code="user_not_found",
            )


class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField(
        min_length=10,
        write_only=True,
    )


class LoginSerializer(TokenObtainPairSerializer):
    default_error_messages = {
        "no_active_account": "РќРµРїСЂР°РІРёР»СЊРЅР° РµР»РµРєС‚СЂРѕРЅРЅР° РїРѕС€С‚Р° Р°Р±Рѕ РїР°СЂРѕР»СЊ.",
    }

    def validate(self, attrs):
        email = (attrs.get(self.username_field) or "").strip()
        user = UserModel.objects.filter(email__iexact=email).first()

        if user is not None:
            attrs[self.username_field] = user.email

        try:
            super().validate(attrs)
        except AuthenticationFailed:
            raise AuthenticationFailed(
                self.error_messages["no_active_account"],
                code="no_active_account",
            )

        access, refresh = JWTService.create_access_and_refresh(self.user)

        return {
            "access": access,
            "refresh": refresh,
        }
