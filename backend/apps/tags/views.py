from __future__ import annotations

from django.db.models import Count
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny

from core.pagination import PagePagination

from .models import TagModel
from .serializers import PopularTagSerializer, TagSerializer


class TagListAPIView(ListAPIView):
    """
    РЎРїРёСЃРѕРє С‚РµРіРѕРІ РґР»СЏ РїРѕРёСЃРєР°/autocomplete.
    РўРµРіРё РЅРµ СЃРѕР·РґР°СЋС‚СЃСЏ РІСЂСѓС‡РЅСѓСЋ С‡РµСЂРµР· API вЂ” РѕРЅРё СЃРёРЅС…СЂРѕРЅРёР·РёСЂСѓСЋС‚СЃСЏ СЃРµСЂРІРёСЃР°РјРё.
    """

    permission_classes = [AllowAny]
    serializer_class = TagSerializer
    pagination_class = PagePagination
    filter_backends = [SearchFilter, OrderingFilter]

    search_fields = ["code"]
    ordering_fields = ["code", "created_at"]
    ordering = ["code"]

    def get_queryset(self):
        qs = TagModel.objects.all().order_by("code")

        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(code__icontains=q.strip().lstrip("#").lower())

        return qs


class PopularTagListAPIView(ListAPIView):
    """
    РџРѕРїСѓР»СЏСЂРЅС‹Рµ С‚РµРіРё РїРѕ РєРѕР»РёС‡РµСЃС‚РІСѓ РїСЂРёРІСЏР·РѕРє TaggedItemModel.
    """

    permission_classes = [AllowAny]
    serializer_class = PopularTagSerializer
    pagination_class = PagePagination
    filter_backends = [OrderingFilter]

    ordering_fields = ["items_count", "code", "created_at"]
    ordering = ["-items_count", "code"]

    def get_queryset(self):
        return (
            TagModel.objects
            .annotate(items_count=Count("items", distinct=True))
            .filter(items_count__gt=0)
            .order_by("-items_count", "code")
        )
