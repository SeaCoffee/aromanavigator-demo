from __future__ import annotations

from django.contrib.contenttypes.models import ContentType
from django.db.models import Count, QuerySet

from .models import TagModel, TaggedItemModel
from core.validators.tags_validators import normalize_tag_code


def tag_queryset() -> QuerySet[TagModel]:
    return TagModel.objects.all()


def search_tags_queryset(*, q: str = "") -> QuerySet[TagModel]:
    qs = tag_queryset()

    query = normalize_tag_code(q)
    if query:
        qs = qs.filter(code__icontains=query)

    return qs.order_by("code")


def popular_tags_queryset(*, q: str = "") -> QuerySet[TagModel]:
    qs = tag_queryset().annotate(items_count=Count("items"))

    query = normalize_tag_code(q)
    if query:
        qs = qs.filter(code__icontains=query)

    return qs.filter(items_count__gt=0).order_by("-items_count", "code")


def tag_codes_for_object(*, obj) -> list[str]:
    ct = ContentType.objects.get_for_model(obj, for_concrete_model=False)

    return list(
        TaggedItemModel.objects
        .filter(content_type=ct, object_id=obj.pk)
        .select_related("tag")
        .order_by("tag__code")
        .values_list("tag__code", flat=True)
    )
