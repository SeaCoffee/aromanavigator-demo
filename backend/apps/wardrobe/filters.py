from django.core.exceptions import ValidationError
from django.db.models import Q
from django_filters import rest_framework as filters

from apps.wardrobe.models import WardrobeItemModel
from core.choises.wardrobe_status_choise import WardrobeStatus


class WardrobeItemFilter(filters.FilterSet):
    status = filters.ChoiceFilter(
        field_name="status",
        choices=WardrobeStatus.choices,
    )

    fragrance = filters.NumberFilter(field_name="fragrance_id")
    brand = filters.NumberFilter(field_name="fragrance__brand_id")
    family = filters.NumberFilter(method="filter_family")
    note = filters.NumberFilter(method="filter_note")

    status_in = filters.CharFilter(method="filter_status_in")
    fragrance_in = filters.CharFilter(method="filter_fragrance_in")
    brand_in = filters.CharFilter(method="filter_brand_in")
    family_in = filters.CharFilter(method="filter_family_in")
    note_in = filters.CharFilter(method="filter_note_in")

    rating_min = filters.NumberFilter(field_name="rating", lookup_expr="gte")
    rating_max = filters.NumberFilter(field_name="rating", lookup_expr="lte")

    created_after = filters.IsoDateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_before = filters.IsoDateTimeFilter(field_name="created_at", lookup_expr="lte")
    updated_after = filters.IsoDateTimeFilter(field_name="updated_at", lookup_expr="gte")
    updated_before = filters.IsoDateTimeFilter(field_name="updated_at", lookup_expr="lte")

    q = filters.CharFilter(method="filter_q", label="Search wardrobe")

    class Meta:
        model = WardrobeItemModel
        fields = [
            "status",
            "fragrance",
            "brand",
            "family",
            "note",
            "rating_min",
            "rating_max",
            "created_after",
            "created_before",
            "updated_after",
            "updated_before",
        ]

    def _csv_values(self, value: str) -> list[str]:
        if not value:
            return []

        return [item.strip() for item in str(value).split(",") if item.strip()]

    def _csv_int_values(self, value: str, field_name: str) -> list[int]:
        values = self._csv_values(value)

        if not values:
            return []

        result: list[int] = []

        for item in values:
            try:
                result.append(int(item))
            except (TypeError, ValueError):
                raise ValidationError({field_name: "РћС‡С–РєСѓС”С‚СЊСЃСЏ СЃРїРёСЃРѕРє id С‡РµСЂРµР· РєРѕРјСѓ."})

        return result

    def filter_status_in(self, qs, name, value):
        values = self._csv_values(value)

        if not values:
            return qs

        allowed_values = set(WardrobeStatus.values)
        invalid_values = [item for item in values if item not in allowed_values]

        if invalid_values:
            raise ValidationError(
                {
                    "status_in": (
                        "РќРµРєРѕСЂРµРєС‚РЅРёР№ СЃС‚Р°С‚СѓСЃ: "
                        + ", ".join(invalid_values)
                    )
                }
            )

        return qs.filter(status__in=values)

    def filter_fragrance_in(self, qs, name, value):
        values = self._csv_int_values(value, "fragrance_in")
        return qs.filter(fragrance_id__in=values) if values else qs

    def filter_brand_in(self, qs, name, value):
        values = self._csv_int_values(value, "brand_in")
        return qs.filter(fragrance__brand_id__in=values) if values else qs

    def filter_family(self, qs, name, value):
        return qs.filter(fragrance__families__id=value).distinct()

    def filter_note(self, qs, name, value):
        return qs.filter(fragrance__notes_official__id=value).distinct()

    def filter_family_in(self, qs, name, value):
        values = self._csv_int_values(value, "family_in")
        return qs.filter(fragrance__families__id__in=values).distinct() if values else qs

    def filter_note_in(self, qs, name, value):
        values = self._csv_int_values(value, "note_in")
        return qs.filter(fragrance__notes_official__id__in=values).distinct() if values else qs

    def filter_q(self, qs, name, value):
        query = (value or "").strip()

        if not query:
            return qs

        return (
            qs.filter(
                Q(notes__icontains=query)
                | Q(fragrance__name__icontains=query)
                | Q(fragrance__brand__name__icontains=query)
            )
            .distinct()
        )
