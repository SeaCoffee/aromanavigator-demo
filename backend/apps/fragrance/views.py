from __future__ import annotations

from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import (
    CreateAPIView,
    DestroyAPIView,
    ListAPIView,
    RetrieveAPIView,
    UpdateAPIView,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from apps.users.permissions import IsNotSuspended, IsStaffRole
from core.pagination import PagePagination

from .filters import FragranceFilter
from .fragrance_query_service import FragranceQueryService
from .fragrance_service import FragranceService
from .slug_service import FragranceSlugService
from .models import (
    BrandModel,
    FragranceModel,
    NoteModel,
    OlfactoryFamilyModel,
    PerfumerModel,
)
from .serializers import (
    BrandSerializer,
    FragranceCreateUpdateInputSerializer,
    FragranceDetailSerializer,
    FragranceListSerializer,
    NoteSerializer,
    OlfactoryFamilySerializer,
    PerfumerSerializer,
    FragranceOptionSerializer,
    BrandOptionSerializer,
    OlfactoryFamilyOptionSerializer,
    PerfumerOptionSerializer,
    NoteOptionSerializer
)
from .utils import parse_id_list

def get_queryset(self):
    qs = FragranceQueryService.list_queryset()
    return FragranceQueryService.with_user_likes(qs, self.request.user)

class BrandListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = BrandSerializer
    pagination_class = PagePagination
    queryset = BrandModel.objects.all().order_by("name", "id")
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "country"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["name", "id"]


class BrandDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = BrandSerializer
    queryset = BrandModel.objects.all()
    lookup_field = "slug"


class BrandCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = BrandSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data["name"]
        country = (serializer.validated_data.get("country") or "").strip()

        if BrandModel.objects.filter(name__iexact=name).exists():
            raise ValidationError({"name": "Р‘СЂРµРЅРґ С–Р· С‚Р°РєРѕСЋ РЅР°Р·РІРѕСЋ РІР¶Рµ С–СЃРЅСѓС”."})

        obj = BrandModel.objects.create(
            name=name,
            country=country,
            slug=FragranceSlugService.build_unique_slug(
                model_cls=BrandModel,
                value=name,
            ),
        )

        return Response(
            BrandSerializer(obj, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )


class PerfumerListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PerfumerSerializer
    pagination_class = PagePagination
    queryset = PerfumerModel.objects.all().order_by("name", "id")
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["name", "id"]


class PerfumerDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = PerfumerSerializer
    queryset = PerfumerModel.objects.all()


class PerfumerCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = PerfumerSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data["name"]

        if PerfumerModel.objects.filter(name__iexact=name).exists():
            raise ValidationError({"name": "РџР°СЂС„СѓРјРµСЂ С–Р· С‚Р°РєРёРј С–РјвЂ™СЏРј СѓР¶Рµ С–СЃРЅСѓС”."})

        obj = PerfumerModel.objects.create(name=name)

        return Response(
            PerfumerSerializer(obj, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )


class NoteListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = NoteSerializer
    pagination_class = PagePagination
    queryset = NoteModel.objects.all().order_by("name", "id")
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["name", "id"]


class NoteDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = NoteSerializer
    queryset = NoteModel.objects.all()
    lookup_field = "slug"


class NoteCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = NoteSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data["name"]

        if NoteModel.objects.filter(name__iexact=name).exists():
            raise ValidationError({"name": "РќРѕС‚Р° Р· С‚Р°РєРѕСЋ РЅР°Р·РІРѕСЋ РІР¶Рµ С–СЃРЅСѓС”."})

        obj = NoteModel.objects.create(
            name=name,
            slug=FragranceSlugService.build_unique_slug(
                model_cls=NoteModel,
                value=name,
            ),
        )

        return Response(
            NoteSerializer(obj, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )


class OlfactoryFamilyListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = OlfactoryFamilySerializer
    pagination_class = PagePagination
    queryset = OlfactoryFamilyModel.objects.all().order_by("name", "id")
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name"]
    ordering_fields = ["name", "created_at", "updated_at"]
    ordering = ["name", "id"]


class OlfactoryFamilyDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = OlfactoryFamilySerializer
    queryset = OlfactoryFamilyModel.objects.all()
    lookup_field = "slug"


class OlfactoryFamilyCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = OlfactoryFamilySerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data["name"]

        if OlfactoryFamilyModel.objects.filter(name__iexact=name).exists():
            raise ValidationError({"name": "РЎС–РјРµР№СЃС‚РІРѕ Р· С‚Р°РєРѕСЋ РЅР°Р·РІРѕСЋ РІР¶Рµ С–СЃРЅСѓС”."})

        obj = OlfactoryFamilyModel.objects.create(
            name=name,
            slug=FragranceSlugService.build_unique_slug(
                model_cls=OlfactoryFamilyModel,
                value=name,
            ),
        )

        return Response(
            OlfactoryFamilySerializer(obj, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )


class FragranceListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = FragranceListSerializer
    pagination_class = PagePagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = FragranceFilter

    def get_queryset(self):
        return FragranceQueryService.list_queryset()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)

        if page is not None:
            items = list(page)
            FragranceQueryService.attach_cover_images(items)
            serializer = self.get_serializer(items, many=True)
            return self.get_paginated_response(serializer.data)

        items = list(queryset)
        FragranceQueryService.attach_cover_images(items)
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)


class FragranceDetailByIdView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = FragranceDetailSerializer
    lookup_field = "pk"

    def get_queryset(self):
        return FragranceQueryService.detail_queryset()

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        FragranceQueryService.attach_cover_image(obj)
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def get_queryset(self):
        qs = FragranceQueryService.detail_queryset()
        return FragranceQueryService.with_user_likes(qs, self.request.user)


class FragranceDetailBySlugView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = FragranceDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return FragranceQueryService.detail_queryset()

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        FragranceQueryService.attach_cover_image(obj)
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def get_queryset(self):
        qs = FragranceQueryService.detail_queryset()
        return FragranceQueryService.with_user_likes(qs, self.request.user)


class FragranceCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = FragranceCreateUpdateInputSerializer
    queryset = FragranceModel.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        obj = FragranceService.create_fragrance(
            brand_id=serializer.validated_data["brand_id"],
            name=serializer.validated_data["name"],
            slug=serializer.validated_data.get("slug", ""),
            release_year=serializer.validated_data.get("release_year"),
        )

        obj = FragranceQueryService.detail_queryset().get(pk=obj.pk)
        FragranceQueryService.attach_cover_image(obj)

        return Response(
            FragranceDetailSerializer(obj, context=self.get_serializer_context()).data,
            status=status.HTTP_201_CREATED,
        )


class FragranceUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = FragranceCreateUpdateInputSerializer
    queryset = FragranceModel.objects.select_related("brand")

    def update(self, request, *args, **kwargs):
        obj = self.get_object()

        serializer = self.get_serializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        slug = (
            serializer.validated_data["slug"]
            if "slug" in serializer.validated_data
            else None
        )

        updated = FragranceService.update_fragrance(
            fragrance=obj,
            brand_id=serializer.validated_data.get("brand_id"),
            name=serializer.validated_data.get("name"),
            slug=slug,
            release_year=serializer.validated_data.get("release_year", obj.release_year),
        )

        updated = FragranceQueryService.detail_queryset().get(pk=updated.pk)
        FragranceQueryService.attach_cover_image(updated)

        return Response(
            FragranceDetailSerializer(updated, context=self.get_serializer_context()).data,
            status=status.HTTP_200_OK,
        )


class FragranceDeleteView(DestroyAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    queryset = FragranceModel.objects.all()


class BaseOptionListView(ListAPIView):
    permission_classes = [AllowAny]
    pagination_class = PagePagination

    search_param = "search"
    ids_param = "ids"

    def filter_by_ids(self, qs):
        ids = parse_id_list(self.request.query_params.get(self.ids_param))

        if ids is None:
            return qs.none()

        if not ids:
            return qs

        return qs.filter(id__in=ids)

    def filter_by_search(self, qs, fields: list[str]):
        search_value = (self.request.query_params.get(self.search_param) or "").strip()

        if not search_value:
            return qs

        query = Q()

        for field in fields:
            query |= Q(**{f"{field}__icontains": search_value})

        return qs.filter(query)

class BrandOptionListView(BaseOptionListView):
    serializer_class = BrandOptionSerializer

    def get_queryset(self):
        qs = BrandModel.objects.all().order_by("name", "id")
        qs = self.filter_by_ids(qs)
        qs = self.filter_by_search(qs, ["name", "country"])
        return qs


class NoteOptionListView(BaseOptionListView):
    serializer_class = NoteOptionSerializer

    def get_queryset(self):
        qs = NoteModel.objects.all().order_by("name", "id")
        qs = self.filter_by_ids(qs)
        qs = self.filter_by_search(qs, ["name"])
        return qs


class OlfactoryFamilyOptionListView(BaseOptionListView):
    serializer_class = OlfactoryFamilyOptionSerializer

    def get_queryset(self):
        qs = OlfactoryFamilyModel.objects.all().order_by("name", "id")
        qs = self.filter_by_ids(qs)
        qs = self.filter_by_search(qs, ["name"])
        return qs


class PerfumerOptionListView(BaseOptionListView):
    serializer_class = PerfumerOptionSerializer

    def get_queryset(self):
        qs = PerfumerModel.objects.all().order_by("name", "id")
        qs = self.filter_by_ids(qs)
        qs = self.filter_by_search(qs, ["name"])
        return qs


class FragranceOptionListView(BaseOptionListView):
    serializer_class = FragranceOptionSerializer

    def get_queryset(self):
        qs = (
            FragranceModel.objects
            .select_related("brand")
            .only(
                "id",
                "name",
                "slug",
                "release_year",
                "brand_id",
                "brand__id",
                "brand__name",
                "brand__slug",
            )
            .order_by("brand__name", "name", "id")
        )

        qs = self.filter_by_ids(qs)

        brand_id = self.request.query_params.get("brand")

        if brand_id not in (None, ""):
            try:
                qs = qs.filter(brand_id=int(brand_id))
            except (TypeError, ValueError):
                return qs.none()

        qs = self.filter_by_search(qs, ["name", "brand__name"])

        return qs
