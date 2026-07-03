from __future__ import annotations

from django.conf import settings

from apps.photos.media_urls import build_media_url, media_file_exists


def get_default_fragrance_cover_image() -> str | None:
    default_cover = getattr(settings, "FRAGRANCE_DEFAULT_COVER_IMAGE", "")

    if not media_file_exists(default_cover):
        return None

    return build_media_url(default_cover)


def get_fragrance_cover_image(obj) -> str | None:
    return (
        getattr(obj, "prefetched_cover_image", None)
        or get_default_fragrance_cover_image()
    )
