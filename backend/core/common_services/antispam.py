from __future__ import annotations

import hashlib
from dataclasses import dataclass

from django.core.cache import cache
from django.core.exceptions import ValidationError


@dataclass(frozen=True)
class CacheAntiSpamPolicy:
    namespace: str
    action: str
    cooldown_seconds: int
    window_seconds: int
    max_actions_per_window: int
    duplicate_window_seconds: int
    staff_exempt: bool = True


def normalize_antispam_text(value: str) -> str:
    return " ".join(str(value or "").strip().lower().split())


def build_antispam_fingerprint(*values: str) -> str:
    normalized = "\n".join(normalize_antispam_text(value) for value in values)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


def is_antispam_exempt(user, *, staff_exempt: bool) -> bool:
    return bool(
        staff_exempt
        and user
        and getattr(user, "is_authenticated", False)
        and getattr(user, "is_staff", False)
    )


class CacheAntiSpamService:
    def __init__(self, policy: CacheAntiSpamPolicy):
        self.policy = policy

    def check(self, *, user, text_parts: tuple[str, ...]) -> None:
        if is_antispam_exempt(user, staff_exempt=self.policy.staff_exempt):
            return

        user_id = int(user.id)
        fingerprint = build_antispam_fingerprint(*text_parts)

        if cache.get(self._key("cooldown", user_id)):
            raise ValidationError(
                "Р—Р°С‡РµРєР°Р№С‚Рµ РєС–Р»СЊРєР° СЃРµРєСѓРЅРґ РїРµСЂРµРґ РЅР°СЃС‚СѓРїРЅРѕСЋ РїСѓР±Р»С–РєР°С†С–С”СЋ."
            )

        action_count = self._get_int(self._key("window", user_id))

        if action_count >= self.policy.max_actions_per_window:
            raise ValidationError(
                "Р—Р°Р±Р°РіР°С‚Рѕ РїСѓР±Р»С–РєР°С†С–Р№ Р·Р° РєРѕСЂРѕС‚РєРёР№ С‡Р°СЃ. РЎРїСЂРѕР±СѓР№С‚Рµ РїС–Р·РЅС–С€Рµ."
            )

        if cache.get(self._key("duplicate", user_id, fingerprint)):
            raise ValidationError("РЎС…РѕР¶РёР№ С‚РµРєСЃС‚ СѓР¶Рµ Р±СѓР»Рѕ РѕРїСѓР±Р»С–РєРѕРІР°РЅРѕ.")

    def mark(self, *, user, text_parts: tuple[str, ...]) -> None:
        if is_antispam_exempt(user, staff_exempt=self.policy.staff_exempt):
            return

        user_id = int(user.id)
        fingerprint = build_antispam_fingerprint(*text_parts)

        cache.set(
            self._key("cooldown", user_id),
            "1",
            timeout=self.policy.cooldown_seconds,
        )
        self._increment_window(user_id)
        cache.set(
            self._key("duplicate", user_id, fingerprint),
            "1",
            timeout=self.policy.duplicate_window_seconds,
        )

    def _key(self, category: str, user_id: int, *parts: object) -> str:
        values = (
            "antispam",
            self.policy.namespace,
            self.policy.action,
            category,
            user_id,
            *parts,
        )
        return ":".join(str(value) for value in values)

    @staticmethod
    def _get_int(key: str) -> int:
        value = cache.get(key, 0)

        try:
            return int(value)
        except (TypeError, ValueError):
            return 0

    def _increment_window(self, user_id: int) -> None:
        key = self._key("window", user_id)

        if cache.add(key, 1, timeout=self.policy.window_seconds):
            return

        try:
            cache.incr(key)
        except ValueError:
            cache.set(key, 1, timeout=self.policy.window_seconds)
