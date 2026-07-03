from __future__ import annotations

from django.utils.text import slugify


def make_unique_slug(
    *,
    model,
    value: str,
    max_length: int,
    base_fallback: str = "item",
    exclude_id: int | None = None,
    extra_filters: dict | None = None,
) -> str:
    base = slugify(str(value or "").strip()) or base_fallback
    base = base[:max_length].strip("-") or base_fallback

    qs = model._default_manager.all()

    if exclude_id:
        qs = qs.exclude(id=exclude_id)

    if extra_filters:
        qs = qs.filter(**extra_filters)

    slug = base
    index = 2

    while qs.filter(slug=slug).exists():
        suffix = f"-{index}"
        slug = f"{base[: max_length - len(suffix)]}{suffix}"
        index += 1

    return slug
