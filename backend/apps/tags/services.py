from __future__ import annotations

from collections.abc import Iterable

from django.contrib.contenttypes.models import ContentType
from django.db import transaction

from .models import TagModel, TaggedItemModel
from core.validators.tags_validators import (
    MAX_TAGS_PER_OBJECT,
    TAG_RE,
    normalize_tag_code,
    validate_tag_code,
)


def extract_tags_from_text(*texts: str, max_tags: int = MAX_TAGS_PER_OBJECT) -> list[str]:
    found: list[str] = []
    seen: set[str] = set()

    for text in texts:
        if not text:
            continue

        for match in TAG_RE.finditer(text):
            code = normalize_tag_code(match.group(1))

            if not code or code in seen:
                continue

            try:
                validate_tag_code(code)
            except Exception:
                continue

            seen.add(code)
            found.append(code)

            if len(found) >= max_tags:
                return found

    return found


def parse_extra_tags(extra: object, *, max_tags: int = MAX_TAGS_PER_OBJECT) -> list[str]:
    if extra is None:
        return []

    if isinstance(extra, str):
        raw_items = extra.split(",")
    elif isinstance(extra, Iterable):
        raw_items = list(extra)
    else:
        return []

    out: list[str] = []
    seen: set[str] = set()

    for raw in raw_items:
        code = normalize_tag_code(str(raw))

        if not code or code in seen:
            continue

        validate_tag_code(code)

        seen.add(code)
        out.append(code)

        if len(out) >= max_tags:
            break

    return out


def merge_tag_codes(
    *,
    text_tags: Iterable[str],
    extra_tags: object = None,
    max_tags: int = MAX_TAGS_PER_OBJECT,
) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()

    for raw in [*text_tags, *parse_extra_tags(extra_tags, max_tags=max_tags)]:
        code = normalize_tag_code(raw)

        if not code or code in seen:
            continue

        validate_tag_code(code)

        seen.add(code)
        out.append(code)

        if len(out) >= max_tags:
            break

    return out


@transaction.atomic
def sync_tags_for_object(
    *,
    obj,
    text_tags: Iterable[str],
    extra_tags: object = None,
    max_tags: int = MAX_TAGS_PER_OBJECT,
) -> None:
    """
    РџСЂРёРІРѕРґРёС‚ С‚РµРіРё РѕР±СЉРµРєС‚Р° Рє СЂРѕРІРЅРѕ Р·Р°РґР°РЅРЅРѕРјСѓ РјРЅРѕР¶РµСЃС‚РІСѓ:
    text_tags в€Є extra_tags.
    """

    if not obj.pk:
        raise ValueError("Object must be saved before syncing tags.")

    content_type = ContentType.objects.get_for_model(obj, for_concrete_model=False)

    desired = set(
        merge_tag_codes(
            text_tags=text_tags,
            extra_tags=extra_tags,
            max_tags=max_tags,
        )
    )

    current = set(
        TaggedItemModel.objects
        .filter(content_type=content_type, object_id=obj.pk)
        .select_related("tag")
        .values_list("tag__code", flat=True)
    )

    to_add = desired - current
    to_delete = current - desired

    if to_delete:
        TaggedItemModel.objects.filter(
            content_type=content_type,
            object_id=obj.pk,
            tag__code__in=to_delete,
        ).delete()

    if not to_add:
        return

    existing_tags = {
        tag.code: tag
        for tag in TagModel.objects.filter(code__in=to_add)
    }

    missing_codes = [
        code for code in to_add
        if code not in existing_tags
    ]

    if missing_codes:
        TagModel.objects.bulk_create(
            [TagModel(code=code) for code in missing_codes],
            ignore_conflicts=True,
        )

        existing_tags.update(
            {
                tag.code: tag
                for tag in TagModel.objects.filter(code__in=missing_codes)
            }
        )

    TaggedItemModel.objects.bulk_create(
        [
            TaggedItemModel(
                content_type=content_type,
                object_id=obj.pk,
                tag=existing_tags[code],
            )
            for code in to_add
            if code in existing_tags
        ],
        ignore_conflicts=True,
    )


@transaction.atomic
def clear_tags_for_object(*, obj) -> None:
    if not obj.pk:
        return

    content_type = ContentType.objects.get_for_model(obj, for_concrete_model=False)

    TaggedItemModel.objects.filter(
        content_type=content_type,
        object_id=obj.pk,
    ).delete()
