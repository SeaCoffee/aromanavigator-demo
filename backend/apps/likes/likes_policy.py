from __future__ import annotations

from dataclasses import dataclass

from django.contrib.contenttypes.models import ContentType


@dataclass(frozen=True)
class LikeTargetConfig:
    key: str
    counter_field: str | None = "likes_count"


LIKE_TARGETS: dict[str, LikeTargetConfig] = {
    "comments.commentmodel": LikeTargetConfig(
        key="comments.commentmodel",
        counter_field="likes_count",
    ),
    "forum.forumtopicmodel": LikeTargetConfig(
        key="forum.forumtopicmodel",
        counter_field="likes_count",
    ),
    "fragrance.fragrancemodel": LikeTargetConfig(
        key="fragrance.fragrancemodel",
        counter_field="likes_count",
    ),
}


ALLOWED_LIKE_MODELS: frozenset[str] = frozenset(LIKE_TARGETS.keys())


def get_content_type_key(content_type: ContentType) -> str:
    return f"{content_type.app_label}.{content_type.model}"


def get_target_key(target) -> str:
    meta = target._meta
    return f"{meta.app_label}.{meta.model_name}"


def is_like_target_allowed(content_type: ContentType) -> bool:
    return get_content_type_key(content_type) in ALLOWED_LIKE_MODELS


def get_like_target_config_by_key(key: str) -> LikeTargetConfig | None:
    return LIKE_TARGETS.get(key)


def get_like_target_config(target) -> LikeTargetConfig | None:
    return get_like_target_config_by_key(get_target_key(target))


def get_like_counter_field(target) -> str | None:
    config = get_like_target_config(target)

    if config is None:
        return None

    return config.counter_field
