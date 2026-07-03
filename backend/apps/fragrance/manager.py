from __future__ import annotations

from django.db import models
from django.db.models import Q


SAFE_ORDERING = {
    "created_at": "created_at",
    "-created_at": "-created_at",
    "updated_at": "updated_at",
    "-updated_at": "-updated_at",
    "likes": "likes_count",
    "-likes": "-likes_count",
    "name": "name",
    "-name": "-name",
    "brand": "brand__name",
    "-brand": "-brand__name",
    "year": "release_year",
    "-year": "-release_year",
}


class FragranceQuerySet(models.QuerySet):
    def with_brand(self, brand_id):
        if brand_id in (None, ""):
            return self

        try:
            return self.filter(brand_id=int(brand_id))
        except (TypeError, ValueError):
            return self.none()

    def year_between(self, year_from=None, year_to=None):
        qs = self

        if year_from not in (None, ""):
            try:
                qs = qs.filter(release_year__gte=int(year_from))
            except (TypeError, ValueError):
                return self.none()

        if year_to not in (None, ""):
            try:
                qs = qs.filter(release_year__lte=int(year_to))
            except (TypeError, ValueError):
                return self.none()

        return qs

    def with_note(self, note_id, level: str | None = None):
        if note_id in (None, ""):
            return self

        try:
            qs = self.filter(official_note_links__note_id=int(note_id))
        except (TypeError, ValueError):
            return self.none()

        if level:
            qs = qs.filter(official_note_links__level=level)

        return qs.distinct()

    def with_family(self, family_id):
        if family_id in (None, ""):
            return self

        try:
            return self.filter(families__id=int(family_id)).distinct()
        except (TypeError, ValueError):
            return self.none()

    def with_perfumer(self, perfumer_id):
        if perfumer_id in (None, ""):
            return self

        try:
            return self.filter(perfumers__id=int(perfumer_id)).distinct()
        except (TypeError, ValueError):
            return self.none()

    def search(self, q: str | None):
        search_value = (q or "").strip()

        if not search_value:
            return self

        return self.filter(
            Q(name__icontains=search_value)
            | Q(brand__name__icontains=search_value)
            | Q(perfumers__name__icontains=search_value)
            | Q(families__name__icontains=search_value)
            | Q(official_note_links__note__name__icontains=search_value)
        ).distinct()

    def safe_order(self, ordering: str | None):
        field = SAFE_ORDERING.get((ordering or "").strip())

        if not field:
            return self.order_by("brand__name", "name", "id")

        return self.order_by(field, "id")


class FragranceManager(models.Manager):
    def get_queryset(self):
        return FragranceQuerySet(self.model, using=self._db)

    def with_brand(self, *args, **kwargs):
        return self.get_queryset().with_brand(*args, **kwargs)

    def year_between(self, *args, **kwargs):
        return self.get_queryset().year_between(*args, **kwargs)

    def with_note(self, *args, **kwargs):
        return self.get_queryset().with_note(*args, **kwargs)

    def with_family(self, *args, **kwargs):
        return self.get_queryset().with_family(*args, **kwargs)

    def with_perfumer(self, *args, **kwargs):
        return self.get_queryset().with_perfumer(*args, **kwargs)

    def search(self, *args, **kwargs):
        return self.get_queryset().search(*args, **kwargs)

    def safe_order(self, *args, **kwargs):
        return self.get_queryset().safe_order(*args, **kwargs)
