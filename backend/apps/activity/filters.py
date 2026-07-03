# apps/activity/filters.py

import django_filters as filters

from apps.activity.models import ActivityEventModel
from core.choises.activity_choises import ActivityVerb


class ActivityEventFilter(filters.FilterSet):
    verb = filters.ChoiceFilter(
        field_name="verb",
        choices=ActivityVerb.choices,
    )

    actor = filters.NumberFilter(field_name="actor_id")

    target_app = filters.CharFilter(field_name="target_app", lookup_expr="iexact")
    target_model = filters.CharFilter(field_name="target_model", lookup_expr="iexact")
    target_id = filters.NumberFilter(field_name="target_id")

    created_from = filters.IsoDateTimeFilter(
        field_name="created_at",
        lookup_expr="gte",
    )
    created_to = filters.IsoDateTimeFilter(
        field_name="created_at",
        lookup_expr="lte",
    )

    order = filters.OrderingFilter(
        fields=(
            ("created_at", "created_at"),
            ("updated_at", "updated_at"),
            ("verb", "verb"),
        ),
    )

    class Meta:
        model = ActivityEventModel
        fields = [
            "verb",
            "actor",
            "target_app",
            "target_model",
            "target_id",
            "created_from",
            "created_to",
        ]
