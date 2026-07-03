from __future__ import annotations

from apps.photos.media_urls import stored_image_url
from apps.photos.models import ObjectCoverModel
from apps.photos.selectors import object_cover_for
from apps.users.models import ProfileModel


def profile_avatar_cover(profile: ProfileModel | None) -> ObjectCoverModel | None:
    if profile is None:
        return None

    attached = getattr(profile, "prefetched_avatar_cover", None)

    if attached is not None:
        return attached

    return object_cover_for(profile)


def profile_avatar_url(profile: ProfileModel | None) -> str | None:
    cover = profile_avatar_cover(profile)

    return stored_image_url(cover.image) if cover else None
