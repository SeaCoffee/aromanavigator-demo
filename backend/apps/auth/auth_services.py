from __future__ import annotations

import logging

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils.timezone import now

from apps.auth.exceptions.jwt_exceptions import (
    JWTBlacklistException,
    JWTException,
    JWTExpiredException,
    JWTInvalidException,
)
from apps.users.models import UserModel
from core.common_services.email_service import EmailService
from core.common_services.jwt_service import (
    ActivateToken,
    JWTService,
    RecoveryToken,
)


logger = logging.getLogger(__name__)


class AuthTokenErrorMessages:
    ACTIVATION = {
        JWTExpiredException: "РўРµСЂРјС–РЅ РґС–С— РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ Р°РєС‚РёРІР°С†С–С— РјРёРЅСѓРІ.",
        JWTBlacklistException: "Р¦Рµ РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ Р°РєС‚РёРІР°С†С–С— РІР¶Рµ РІРёРєРѕСЂРёСЃС‚Р°РЅРѕ.",
        JWTInvalidException: "РќРµРґС–Р№СЃРЅРµ РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ Р°РєС‚РёРІР°С†С–С—.",
        JWTException: "РќРµ РІРґР°Р»РѕСЃСЏ РїРµСЂРµРІС–СЂРёС‚Рё РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ Р°РєС‚РёРІР°С†С–С—.",
    }

    RECOVERY = {
        JWTExpiredException: "РўРµСЂРјС–РЅ РґС–С— РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ РІС–РґРЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ РјРёРЅСѓРІ.",
        JWTBlacklistException: "Р¦Рµ РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ РІС–РґРЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ РІР¶Рµ РІРёРєРѕСЂРёСЃС‚Р°РЅРѕ.",
        JWTInvalidException: "РќРµРґС–Р№СЃРЅРµ РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ РІС–РґРЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ.",
        JWTException: "РќРµ РІРґР°Р»РѕСЃСЏ РїРµСЂРµРІС–СЂРёС‚Рё РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ РІС–РґРЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ.",
    }


class AuthActivationService:
    @staticmethod
    @transaction.atomic
    def activate(token: str) -> UserModel:
        user = JWTService.verify_action_token(
            token,
            ActivateToken,
            consume=True,
        )

        update_fields = []

        if not user.is_active:
            user.is_active = True
            update_fields.append("is_active")

        if not user.email_verified:
            user.email_verified = True
            update_fields.append("email_verified")

        if update_fields:
            update_fields.append("updated_at")
            user.save(update_fields=update_fields)

        return user


class PasswordRecoveryService:
    @staticmethod
    def request_recovery(email: str) -> None:
        normalized_email = UserModel.objects.normalize_email((email or "").strip())
        user = UserModel.objects.filter(email__iexact=normalized_email).first()

        if not user:
            return

        PasswordRecoveryService._send_recovery_email(user)

    @staticmethod
    def _send_recovery_email(user: UserModel) -> None:
        try:
            EmailService.recovery(user)
        except Exception:
            logger.exception(
                "Failed to send recovery email for user_id=%s",
                user.id,
            )

    @staticmethod
    def _send_password_changed_email(user: UserModel) -> None:
        try:
            EmailService.password_changed(user)
        except Exception:
            logger.exception(
                "Failed to send password changed email for user_id=%s",
                user.id,
            )

    @staticmethod
    def verify_recovery_token(token: str) -> UserModel:
        return JWTService.verify_action_token(
            token,
            RecoveryToken,
            consume=False,
        )

    @staticmethod
    @transaction.atomic
    def reset_password(*, token: str, password: str) -> UserModel:
        user = JWTService.verify_action_token(
            token,
            RecoveryToken,
            consume=True,
        )

        if user.has_usable_password() and user.check_password(password):
            raise ValidationError(
                {"password": ["РќРѕРІРёР№ РїР°СЂРѕР»СЊ РјР°С” РІС–РґСЂС–Р·РЅСЏС‚РёСЃСЏ РІС–Рґ РїРѕС‚РѕС‡РЅРѕРіРѕ."]}
            )

        user.set_password(password)

        update_fields = ["password", "updated_at"]

        if not user.is_active:
            user.is_active = True
            update_fields.append("is_active")

        if not user.email_verified:
            user.email_verified = True
            update_fields.append("email_verified")

        user.last_logout = now()
        update_fields.append("last_logout")

        user.save(update_fields=update_fields)

        JWTService.blacklist_user_tokens(user)

        transaction.on_commit(
            lambda: PasswordRecoveryService._send_password_changed_email(user)
        )

        return user


class AuthLogoutService:
    @staticmethod
    @transaction.atomic
    def logout(*, user: UserModel, refresh: str | None) -> None:
        if hasattr(user, "last_logout"):
            user.last_logout = now()
            user.save(update_fields=["last_logout", "updated_at"])

        JWTService.blacklist_refresh(refresh)
