from __future__ import annotations

import logging

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from core.common_services.email_service import EmailService
from core.common_services.jwt_service import JWTService


logger = logging.getLogger(__name__)


class UserPasswordService:
    @staticmethod
    def request_password_setup(*, user) -> None:
        if user.has_usable_password():
            raise ValidationError(
                {
                    "detail": [
                        "РџР°СЂРѕР»СЊ РґР»СЏ С†СЊРѕРіРѕ Р°РєР°СѓРЅС‚Р° РІР¶Рµ РІСЃС‚Р°РЅРѕРІР»РµРЅРѕ."
                    ]
                }
            )

        EmailService.recovery(user)

    @staticmethod
    @transaction.atomic
    def change_password(
        *,
        user,
        old_password: str,
        new_password: str,
    ) -> None:
        if not user.has_usable_password():
            raise ValidationError(
                {
                    "old_password": [
                        "Р”Р»СЏ С†СЊРѕРіРѕ РѕР±Р»С–РєРѕРІРѕРіРѕ Р·Р°РїРёСЃСѓ РїР°СЂРѕР»СЊ РЅРµ РІСЃС‚Р°РЅРѕРІР»РµРЅРѕ. "
                        "РЎРєРѕСЂРёСЃС‚Р°Р№С‚РµСЃСЏ РІС–РґРЅРѕРІР»РµРЅРЅСЏРј РїР°СЂРѕР»СЏ."
                    ]
                }
            )

        if not user.check_password(old_password):
            raise ValidationError({"old_password": ["РџРѕС‚РѕС‡РЅРёР№ РїР°СЂРѕР»СЊ СѓРєР°Р·Р°РЅРѕ РЅРµРїСЂР°РІРёР»СЊРЅРѕ."]})

        if user.check_password(new_password):
            raise ValidationError(
                {
                    "new_password": [
                        "РќРѕРІРёР№ РїР°СЂРѕР»СЊ РјР°С” РІС–РґСЂС–Р·РЅСЏС‚РёСЃСЏ РІС–Рґ РїРѕС‚РѕС‡РЅРѕРіРѕ."
                    ]
                }
            )

        user.set_password(new_password)
        user.last_logout = timezone.now()
        user.save(update_fields=["password", "last_logout", "updated_at"])

        JWTService.blacklist_user_tokens(user)

        transaction.on_commit(
            lambda: UserPasswordService._send_password_changed_email(user)
        )

    @staticmethod
    def _send_password_changed_email(user) -> None:
        try:
            EmailService.password_changed(user)
        except Exception:
            logger.exception(
                "Failed to send password changed email for user_id=%s",
                user.id,
            )
