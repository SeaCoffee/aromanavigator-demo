from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from django.contrib.contenttypes.models import ContentType


PhotoCapability = Literal[
    "attachments",
    "cover",
    "private_attachments",
    "typed_perfume_photos",
]


@dataclass(frozen=True)
class PhotoTargetPolicy:
    capabilities: frozenset[PhotoCapability]
    watermark_cover: bool = True
    watermark_attachments: bool = True


PHOTO_TARGET_POLICIES: dict[str, PhotoTargetPolicy] = {
    "articles.article": PhotoTargetPolicy(frozenset({"cover", "attachments"})),
    "comments.commentmodel": PhotoTargetPolicy(frozenset({"attachments"})),
    "forum.forumsectionmodel": PhotoTargetPolicy(frozenset({"cover", "attachments"})),
    "forum.forumtopicmodel": PhotoTargetPolicy(frozenset({"cover", "attachments"})),
    "fragrance.fragrancemodel": PhotoTargetPolicy(frozenset({"cover", "attachments"})),
    "fragrance_ugc.fragranceaddrequestmodel": PhotoTargetPolicy(
        frozenset({"attachments"}),
    ),
    "users.profilemodel": PhotoTargetPolicy(
        frozenset({"cover"}),
        watermark_cover=False,
    ),
}


TYPED_PERFUME_TARGETS = {}


def content_type_label(content_type: ContentType) -> str:
    return f"{content_type.app_label}.{content_type.model}"


def policy_for_content_type(content_type: ContentType) -> PhotoTargetPolicy | None:
    return PHOTO_TARGET_POLICIES.get(content_type_label(content_type))


def target_supports(content_type: ContentType, capability: PhotoCapability) -> bool:
    policy = policy_for_content_type(content_type)
    return bool(policy and capability in policy.capabilities)


def is_object_attachment_target_allowed(content_type: ContentType) -> bool:
    return target_supports(content_type, "attachments")


def is_object_cover_target_allowed(content_type: ContentType) -> bool:
    return target_supports(content_type, "cover")


def is_object_photo_target_allowed(content_type: ContentType) -> bool:
    return bool(
        target_supports(content_type, "cover")
        or target_supports(content_type, "attachments")
    )


def is_private_attachment_target_allowed(content_type: ContentType) -> bool:
    return target_supports(content_type, "private_attachments")


def typed_perfume_model(model_key: str):
    target_label = TYPED_PERFUME_TARGETS.get((model_key or "").strip().lower())

    if not target_label:
        return None

    app_label, model = target_label.split(".", 1)

    try:
        content_type = ContentType.objects.get_by_natural_key(app_label, model)
    except ContentType.DoesNotExist:
        return None

    return content_type.model_class()
