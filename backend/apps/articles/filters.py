from django.core.exceptions import ValidationError
from django.db.models import Q
from django_filters import rest_framework as filters

from apps.articles.models import Article
from core.choises.article_status_choise import ArticleStatus


class ArticleFilter(filters.FilterSet):
    q = filters.CharFilter(method="filter_q", label="Search")
    status = filters.ChoiceFilter(
        field_name="status",
        choices=ArticleStatus.choices,
    )
    status_in = filters.CharFilter(method="filter_status_in")

    tag = filters.NumberFilter(field_name="tags__id")
    tag_name = filters.CharFilter(field_name="tags__name", lookup_expr="iexact")
    tags = filters.CharFilter(method="filter_tags")
    tags_in = filters.CharFilter(method="filter_tags_in")

    author = filters.NumberFilter(field_name="author_id")

    created_after = filters.IsoDateTimeFilter(field_name="created_at", lookup_expr="gte")
    created_before = filters.IsoDateTimeFilter(field_name="created_at", lookup_expr="lte")
    updated_after = filters.IsoDateTimeFilter(field_name="updated_at", lookup_expr="gte")
    updated_before = filters.IsoDateTimeFilter(field_name="updated_at", lookup_expr="lte")

    ordering = filters.OrderingFilter(
        fields=(
            ("created_at", "created_at"),
            ("updated_at", "updated_at"),
            ("title", "title"),
            ("status", "status"),
        ),
    )

    class Meta:
        model = Article
        fields = [
            "q",
            "status",
            "status_in",
            "tag",
            "tag_name",
            "tags",
            "tags_in",
            "author",
            "created_after",
            "created_before",
            "updated_after",
            "updated_before",
        ]

    def _csv_values(self, value: str) -> list[str]:
        if not value:
            return []

        return [
            item.strip()
            for item in str(value).split(",")
            if item.strip()
        ]

    def _csv_int_values(self, value: str, field_name: str) -> list[int]:
        result: list[int] = []

        for item in self._csv_values(value):
            try:
                result.append(int(item))
            except (TypeError, ValueError):
                raise ValidationError({field_name: "РћС‡С–РєСѓС”С‚СЊСЃСЏ СЃРїРёСЃРѕРє id С‡РµСЂРµР· РєРѕРјСѓ."})

        return result

    def filter_q(self, qs, name, value):
        query = str(value or "").strip()

        if not query:
            return qs

        return (
            qs.filter(
                Q(title__icontains=query)
                | Q(content__icontains=query)
                | Q(tags__name__icontains=query)
                | Q(author__profile__display_name__icontains=query)
            )
            .distinct()
        )

    def filter_status_in(self, qs, name, value):
        values = self._csv_values(value)

        if not values:
            return qs

        allowed_values = set(ArticleStatus.values)
        invalid_values = [
            item
            for item in values
            if item not in allowed_values
        ]

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

    def filter_tags(self, qs, name, value):
        names = self._csv_values(value)

        if not names:
            return qs

        return qs.filter(tags__name__in=names).distinct()

    def filter_tags_in(self, qs, name, value):
        ids = self._csv_int_values(value, "tags_in")

        if not ids:
            return qs

        return qs.filter(tags__id__in=ids).distinct()
