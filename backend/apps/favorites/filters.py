import django_filters as df

from apps.favorites.models import PerfumeFavoriteModel


class FavoriteFilter(df.FilterSet):
    app = df.CharFilter(field_name="content_type__app_label", lookup_expr="iexact")
    model = df.CharFilter(field_name="content_type__model", lookup_expr="iexact")

    created_from = df.DateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_to = df.DateTimeFilter(field_name="created_at", lookup_expr="lte")

    ordering = df.OrderingFilter(
        fields=(
            ("created_at", "created_at"),
        ),
    )

    class Meta:
        model = PerfumeFavoriteModel
        fields = []
