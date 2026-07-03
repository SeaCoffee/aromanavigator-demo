from __future__ import annotations

from django.contrib.contenttypes.models import ContentType

from core.policies.target_allowlist import allow_ct


SUBSCRIPTION_TARGETS: frozenset[str] = frozenset(
    {
        "forum.forumsectionmodel",
        "forum.forumtopicmodel",
    }
)


def target_key(app_label: str, model: str) -> str:
    return f"{app_label}.{model}"


def get_content_type_key(ct: ContentType) -> str:
    return target_key(ct.app_label, ct.model)


def get_target_key(target) -> str:
    meta = target._meta
    return target_key(meta.app_label, meta.model_name)


def is_allowed_target(app_label: str, model: str) -> bool:
    return target_key(app_label, model) in SUBSCRIPTION_TARGETS


def is_subscription_target_allowed(ct: ContentType) -> bool:
    return get_content_type_key(ct) in SUBSCRIPTION_TARGETS


allow_subscription_ct = allow_ct(SUBSCRIPTION_TARGETS)
