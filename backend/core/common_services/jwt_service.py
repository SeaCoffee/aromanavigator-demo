from __future__ import annotations

import logging
from typing import Any, TypeAlias

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.token_blacklist.models import (
    BlacklistedToken,
    OutstandingToken,
)
from rest_framework_simplejwt.tokens import (
    BlacklistMixin,
    RefreshToken,
    Token,
    TokenError,
)

from apps.auth.exceptions.jwt_exceptions import (
    JWTBlacklistException,
    JWTException,
    JWTExpiredException,
    JWTInvalidException,
)
from core.enums.action_token_enum import ActionTokenEnum


logger = logging.getLogger(__name__)

UserModel = get_user_model()


class ActionToken(BlacklistMixin, Token):
    """Р‘Р°Р·РѕРІС‹Р№ action-С‚РѕРєРµРЅ СЃ РїРѕРґРґРµСЂР¶РєРѕР№ blacklist."""
    pass


class ActivateToken(ActionToken):
    token_type = ActionTokenEnum.ACTIVATE.token_type
    lifetime = ActionTokenEnum.ACTIVATE.lifetime


class RecoveryToken(ActionToken):
    token_type = ActionTokenEnum.RECOVERY.token_type
    lifetime = ActionTokenEnum.RECOVERY.lifetime


ActionTokenClassType: TypeAlias = type[ActionToken]


class JWTService:
    @staticmethod
    def create_action_token(user: Any, token_class: ActionTokenClassType) -> str:
        tok = token_class.for_user(user)
        return str(tok)

    @staticmethod
    def verify_action_token(
        token_str: str,
        token_class: ActionTokenClassType,
        *,
        consume: bool = False,
    ) -> Any:
        try:
            tok = token_class(token_str)
            tok.check_blacklist()
        except TokenError as e:
            msg = str(e).lower()

            if "blacklisted" in msg:
                raise JWTBlacklistException()

            if "expired" in msg:
                raise JWTExpiredException()

            raise JWTInvalidException(str(e))

        except Exception as e:
            raise JWTException(f"Unexpected JWT error: {e}") from e

        user_id = tok.payload.get("user_id")
        user = get_object_or_404(UserModel, pk=user_id)

        if consume:
            try:
                tok.blacklist()
            except TokenError:
                pass

        return user

    @staticmethod
    def create_access_and_refresh(user: Any) -> tuple[str, str]:
        if not getattr(user, "is_active", False):
            raise PermissionDenied("Account is not activated. Please check your email.")

        user.last_login = now()
        user.save(update_fields=["last_login", "updated_at"])

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return str(access), str(refresh)

    @staticmethod
    def blacklist_refresh(refresh_token_str: str | None) -> None:
        if not refresh_token_str:
            return

        try:
            RefreshToken(refresh_token_str).blacklist()
        except TokenError:
            pass

    @staticmethod
    def blacklist_user_tokens(user: Any) -> None:
        try:
            for token in OutstandingToken.objects.filter(user=user):
                BlacklistedToken.objects.get_or_create(token=token)
        except Exception:
            logger.exception("Failed to blacklist tokens for user_id=%s", user.id)

def issue_tokens_payload(user: Any) -> dict:
    access, refresh = JWTService.create_access_and_refresh(user)
    return {"access": access, "refresh": refresh}
