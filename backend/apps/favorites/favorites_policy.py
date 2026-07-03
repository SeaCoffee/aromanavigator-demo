from __future__ import annotations

from dataclasses import dataclass

from django.contrib.contenttypes.models import ContentType


@dataclass(frozen=True)
class FavoriteTargetConfig:
    key: str
    counter_field: str | None = None


FAVORITE_TARGETS: dict[str, FavoriteTargetConfig] = {
    "fragrance.fragrancemodel": FavoriteTargetConfig(
        key="fragrance.fragrancemodel",
    ),
    "forum.forumtopicmodel": FavoriteTargetConfig(
        key="forum.forumtopicmodel",
    ),
}

ALLOWED_FAVORITE_MODELS: frozenset[str] = frozenset(FAVORITE_TARGETS.keys())


def get_content_type_key(ct: ContentType) -> str:
    return f"{ct.app_label}.{ct.model}"


def get_target_key(target) -> str:
    meta = target._meta
    return f"{meta.app_label}.{meta.model_name}"


def is_favorite_target_allowed(ct: ContentType) -> bool:
    return get_content_type_key(ct) in ALLOWED_FAVORITE_MODELS


def get_favorite_target_config(target) -> FavoriteTargetConfig | None:
    return FAVORITE_TARGETS.get(get_target_key(target))
