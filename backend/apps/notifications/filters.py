import django_filters as df

from apps.notifications.models import NotificationModel


class NotificationFilter(df.FilterSet):
    is_read = df.BooleanFilter(field_name="is_read")
    verb = df.CharFilter(field_name="verb", lookup_expr="iexact")

    created_from = df.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_to = df.DateTimeFilter(field_name="created_at", lookup_expr="lte")

    ordering = df.OrderingFilter(
        fields=(
            ("created_at", "created_at"),
            ("is_read", "is_read"),
        ),
    )

    class Meta:
        model = NotificationModel
        fields = []
