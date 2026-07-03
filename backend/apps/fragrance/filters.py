from __future__ import annotations

import django_filters as df
from django.db.models import Q

from .models import FragranceModel


def _multi_values(data, name: str, value) -> list[str]:
    if hasattr(data, "getlist"):
        values = data.getlist(name)
    else:
        values = []

    if not values and value not in (None, ""):
        values = [value]

    result: list[str] = []

    for item in values:
        for part in str(item).split(","):
            clean = part.strip()
            if clean:
                result.append(clean)

    return result


def _valid_int_values(values: list[str]) -> list[int] | None:
    result: list[int] = []

    for value in values:
        try:
            result.append(int(value))
        except (TypeError, ValueError):
            return None

    return result


class FragranceFilter(df.FilterSet):
    fragrance_id = df.NumberFilter(field_name="id")
    name = df.CharFilter(method="filter_name")

    brand = df.NumberFilter(field_name="brand_id")
    note = df.NumberFilter(method="filter_note")
    family = df.NumberFilter(method="filter_family")
    perfumer = df.NumberFilter(method="filter_perfumer")

    year_from = df.NumberFilter(method="filter_year_from")
    year_to = df.NumberFilter(method="filter_year_to")

    q = df.CharFilter(method="filter_q")
    ordering = df.CharFilter(method="filter_ordering")

    class Meta:
        model = FragranceModel
        fields = [
            "fragrance_id",
            "name",
            "brand",
            "note",
            "family",
            "perfumer",
            "year_from",
            "year_to",
            "q",
        ]

    def filter_name(self, qs, name, value):
        search_value = (value or "").strip()

        if not search_value:
            return qs

        return qs.filter(name__icontains=search_value)


    def filter_note(self, qs, name, value):
        note_ids = _valid_int_values(_multi_values(self.data, name, value))

        if note_ids is None:
            return qs.none()

        if not note_ids:
            return qs

        level = self.data.get("note_level")

        note_filter = Q(official_note_links__note_id__in=note_ids)

        if level:
            note_filter &= Q(official_note_links__level=level)

        return qs.filter(note_filter).distinct()


    def filter_family(self, qs, name, value):
        family_ids = _valid_int_values(_multi_values(self.data, name, value))

        if family_ids is None:
            return qs.none()

        if not family_ids:
            return qs

        return qs.filter(families__id__in=family_ids).distinct()


    def filter_perfumer(self, qs, name, value):
        perfumer_ids = _valid_int_values(_multi_values(self.data, name, value))

        if perfumer_ids is None:
            return qs.none()

        if not perfumer_ids:
            return qs

        return qs.filter(perfumers__id__in=perfumer_ids).distinct()


    def filter_year_from(self, qs, name, value):
        return qs.year_between(year_from=value)

    def filter_year_to(self, qs, name, value):
        return qs.year_between(year_to=value)

    def filter_q(self, qs, name, value):
        return qs.search(value)

    def filter_ordering(self, qs, name, value):
        return qs.safe_order(value)
