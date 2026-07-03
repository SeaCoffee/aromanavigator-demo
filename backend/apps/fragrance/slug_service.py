from __future__ import annotations

from django.db import models
from django.utils.text import slugify


class FragranceSlugService:
    @staticmethod
    def build_unique_slug(
        *,
        model_cls: type[models.Model],
        value: str,
        instance_id: int | None = None,
    ) -> str:
        base = slugify((value or "").strip(), allow_unicode=True)[:240] or "item"
        slug = base
        idx = 2

        qs = model_cls.objects.all()
        if instance_id is not None:
            qs = qs.exclude(id=instance_id)

        while qs.filter(slug=slug).exists():
            suffix = f"-{idx}"
            slug = f"{base[:255 - len(suffix)]}{suffix}"
            idx += 1

        return slug
