from django.contrib.contenttypes.models import ContentType
from django_filters import rest_framework as filters

from apps.exchange.models import ExchangeProposalModel
from apps.wardrobe.models import WardrobeItemModel
from core.choises.exchange_status import ExchangeStatus


class ExchangeProposalFilter(filters.FilterSet):
    status = filters.ChoiceFilter(
        field_name="status",
        choices=ExchangeStatus.choices,
    )

    requested_type = filters.CharFilter(method="filter_requested_type")

    created_after = filters.IsoDateTimeFilter(
        field_name="created_at",
        lookup_expr="gte",
    )
    created_before = filters.IsoDateTimeFilter(
        field_name="created_at",
        lookup_expr="lte",
    )

    updated_after = filters.IsoDateTimeFilter(
        field_name="updated_at",
        lookup_expr="gte",
    )
    updated_before = filters.IsoDateTimeFilter(
        field_name="updated_at",
        lookup_expr="lte",
    )

    order = filters.OrderingFilter(
        fields=(
            ("created_at", "created_at"),
            ("updated_at", "updated_at"),
            ("status", "status"),
        ),
    )

    class Meta:
        model = ExchangeProposalModel
        fields = [
            "status",
            "requested_type",
            "created_after",
            "created_before",
            "updated_after",
            "updated_before",
        ]

    def filter_requested_type(self, queryset, name, value):
        item_type = (value or "").strip()

        if item_type != "wardrobe":
            return queryset.none()

        content_type = ContentType.objects.get_for_model(
            WardrobeItemModel,
            for_concrete_model=False,
        )

        return queryset.filter(requested_ct=content_type)
