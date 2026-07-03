# core/validators/status_validators.py
from __future__ import annotations

from rest_framework import serializers

from core.choises.status_choise import STATUS_CHOISE


_ALLOWED_MOD_STATUSES = {
    STATUS_CHOISE.PENDING,
    STATUS_CHOISE.APPROVED,
    STATUS_CHOISE.REJECTED,
}


def validate_mod_status(value: str) -> str:
    clean_value = (value or "").strip().lower()
    if clean_value not in _ALLOWED_MOD_STATUSES:
        raise serializers.ValidationError({"status": "РќРµРєРѕСЂРµРєС‚РЅРёР№ СЃС‚Р°С‚СѓСЃ."})
    return clean_value
