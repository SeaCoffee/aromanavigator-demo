from __future__ import annotations

from urllib.parse import urljoin

from django.conf import settings
from django.core.files.storage import default_storage


def build_media_url(path: str | None) -> str | None:
    clean_path = (path or "").strip()

    if not clean_path:
        return None

    if clean_path.startswith(("http://", "https://", "/")):
        return clean_path

    return urljoin(settings.MEDIA_URL, clean_path)


def media_file_exists(path: str | None) -> bool:
    clean_path = (path or "").strip()

    if not clean_path or clean_path.startswith(("http://", "https://")):
        return False

    if clean_path.startswith(settings.MEDIA_URL):
        clean_path = clean_path.removeprefix(settings.MEDIA_URL)
    elif clean_path.startswith("/media/"):
        clean_path = clean_path.removeprefix("/media/")
    elif clean_path.startswith("/"):
        clean_path = clean_path.lstrip("/")

    return default_storage.exists(clean_path)


def stored_image_url(image, *, default=None):
    if not image:
        return default

    try:
        return image.url
    except ValueError:
        return default
