from __future__ import annotations

from functools import cached_property
from typing import Any

from django.conf import settings
from django.core.files.storage import FileSystemStorage, Storage
from django.utils.deconstruct import deconstructible
from django.utils.module_loading import import_string


def _storage_options(setting_name: str) -> dict[str, Any]:
    value = getattr(settings, setting_name, {}) or {}

    if not isinstance(value, dict):
        raise TypeError(f"{setting_name} must be a dict.")

    return value.copy()


@deconstructible
class ConfiguredStorage(Storage):
    """
    Stable wrapper around a storage configured in Django settings.

    Models and migrations can keep referencing this small wrapper while the
    real backend changes later (local filesystem, S3, MinIO, CDN-backed
    storage, etc.) through environment/settings only.
    """

    backend_setting_name: str
    options_setting_name: str

    def __init__(
        self,
        backend_setting_name: str,
        options_setting_name: str,
    ) -> None:
        self.backend_setting_name = backend_setting_name
        self.options_setting_name = options_setting_name

    @cached_property
    def wrapped(self) -> Storage:
        backend_path = getattr(settings, self.backend_setting_name, "")
        backend_cls = import_string(backend_path or "django.core.files.storage.FileSystemStorage")
        return backend_cls(**_storage_options(self.options_setting_name))

    def _open(self, name: str, mode: str = "rb"):
        return self.wrapped.open(name, mode)

    def _save(self, name: str, content):
        return self.wrapped.save(name, content)

    def delete(self, name: str) -> None:
        return self.wrapped.delete(name)

    def exists(self, name: str) -> bool:
        return self.wrapped.exists(name)

    def listdir(self, path: str):
        return self.wrapped.listdir(path)

    def size(self, name: str) -> int:
        return self.wrapped.size(name)

    def url(self, name: str) -> str:
        return self.wrapped.url(name)

    def path(self, name: str) -> str:
        if hasattr(self.wrapped, "path"):
            return self.wrapped.path(name)

        raise NotImplementedError("This storage backend does not expose filesystem paths.")


@deconstructible
class PublicMediaStorage(ConfiguredStorage):
    def __init__(self) -> None:
        super().__init__(
            "PUBLIC_MEDIA_STORAGE_BACKEND",
            "PUBLIC_MEDIA_STORAGE_OPTIONS",
        )


@deconstructible
class PrivateMediaStorage(ConfiguredStorage):
    def __init__(self) -> None:
        super().__init__(
            "PRIVATE_MEDIA_STORAGE_BACKEND",
            "PRIVATE_MEDIA_STORAGE_OPTIONS",
        )

    def url(self, name: str) -> str:
        raise NotImplementedError("Private media files must be served through protected views.")


def public_filesystem_storage() -> FileSystemStorage:
    return FileSystemStorage(**settings.PUBLIC_MEDIA_STORAGE_OPTIONS)
