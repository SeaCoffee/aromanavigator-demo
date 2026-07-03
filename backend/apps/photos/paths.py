from __future__ import annotations

import os
from uuid import uuid4


def _target_parts(instance) -> tuple[str, str, str]:
    content_type = instance.content_type
    return (
        content_type.app_label,
        content_type.model,
        str(instance.object_id),
    )


def _photo_path(instance, kind: str, extension: str = "jpg") -> str:
    app_label, model, object_id = _target_parts(instance)
    return os.path.join(
        "photos",
        kind,
        app_label,
        model,
        object_id,
        f"{uuid4()}.{extension}",
    )


def upload_typed_perfume_photo(instance, filename: str) -> str:
    return _photo_path(instance, "typed")


def upload_object_photo(instance, filename: str) -> str:
    return _photo_path(instance, "attachments")


def upload_object_cover(instance, filename: str) -> str:
    return _photo_path(instance, "covers")


def upload_private_object_photo(instance, filename: str) -> str:
    return _photo_path(instance, "private")
