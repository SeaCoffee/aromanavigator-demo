# core/policies/target_allowlist.py
from __future__ import annotations

from typing import Callable, Iterable, Set

from django.contrib.contenttypes.models import ContentType


def ct_key(ct: ContentType) -> str:
    return f"{ct.app_label}.{ct.model}"


def is_allowed_ct(ct: ContentType, allowed: Set[str] | Iterable[str] | None) -> bool:
    if not allowed:
        return True
    allowed_set = allowed if isinstance(allowed, set) else set(allowed)
    return ct_key(ct) in allowed_set


def allow_ct(allowed: Set[str] | Iterable[str] | None) -> Callable[[ContentType], bool]:
    """
    РЈРґРѕР±РЅС‹Р№ Р°РґР°РїС‚РµСЂ: РїСЂРµРІСЂР°С‰Р°РµС‚ allowlist РІ С„СѓРЅРєС†РёСЋ-РїСЂРµРґРёРєР°С‚.
    РСЃРїРѕР»СЊР·СѓРµРј РІ TargetReferenceField(allow_ct=...)
    """
    return lambda ct: is_allowed_ct(ct, allowed)
