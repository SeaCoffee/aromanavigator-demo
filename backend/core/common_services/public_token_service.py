# core/services/public_token_service.py

from __future__ import annotations

import secrets
from hashlib import sha256


class PublicTokenService:
    @staticmethod
    def create_token_urlsafe() -> str:
        return secrets.token_urlsafe(32)

    @staticmethod
    def hash_token(token: str) -> str:
        return sha256(token.encode("utf-8")).hexdigest()

    @staticmethod
    def matches(*, raw_token: str, token_hash: str) -> bool:
        return PublicTokenService.hash_token(raw_token) == token_hash
