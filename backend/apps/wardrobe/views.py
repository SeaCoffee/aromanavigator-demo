from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.users.permissions import IsNotSuspended
from apps.wardrobe.filters import WardrobeItemFilter
from apps.wardrobe.selectors import (
    public_wardrobe_for_display_name,
    public_wardrobe_for_user_id,
    wardrobe_for_user,
)
from apps.wardrobe.serializers import (
    WardrobeItemCreateSerializer,
    WardrobeItemSerializer,
    WardrobeItemUpdateSerializer,
)
from apps.wardrobe.wardrobe_service import WardrobeError, WardrobeService
from core.choises.wardrobe_status_choise import WardrobeStatus
from core.pagination import PagePagination


class MyWardrobeListCreateView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WardrobeItemSerializer
    pagination_class = PagePagination
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = WardrobeItemFilter
    search_fields = [
        "notes",
        "fragrance__name",
        "fragrance__brand__name",
    ]
    ordering_fields = [
        "updated_at",
        "created_at",
        "rating",
        "status",
        "fragrance__name",
        "fragrance__brand__name",
    ]
    ordering = ["fragrance__brand__name", "fragrance__name", "status"]

    def get_queryset(self):
        return wardrobe_for_user(self.request.user)

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsNotSuspended()]

        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return WardrobeItemCreateSerializer

        return WardrobeItemSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            item = WardrobeService.add_item(
                user=request.user,
                fragrance_id=serializer.validated_data["fragrance_id"],
                status=serializer.validated_data.get("status", WardrobeStatus.OWN),
                rating=serializer.validated_data.get("rating"),
                notes=serializer.validated_data.get("notes", ""),
                is_private=serializer.validated_data.get("is_private", False),
            )
        except WardrobeError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            WardrobeItemSerializer(
                item,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_201_CREATED,
        )


class PublicWardrobeListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = WardrobeItemSerializer
    pagination_class = PagePagination
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = WardrobeItemFilter
    search_fields = [
        "notes",
        "fragrance__name",
        "fragrance__brand__name",
    ]
    ordering_fields = [
        "updated_at",
        "created_at",
        "rating",
        "status",
        "fragrance__name",
        "fragrance__brand__name",
    ]
    ordering = ["fragrance__brand__name", "fragrance__name", "status"]

    def get_queryset(self):
        user_id = self.kwargs.get("user_id")

        if user_id is not None:
            return public_wardrobe_for_user_id(
                user_id=int(user_id),
                viewer=self.request.user,
            )

        return public_wardrobe_for_display_name(
            display_name=self.kwargs["display_name"],
            viewer=self.request.user,
        )


class WardrobeDetailView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return WardrobeItemUpdateSerializer

        return WardrobeItemSerializer

    def get(self, request, item_id: int):
        try:
            item = WardrobeService.get_item(request.user, item_id)
        except WardrobeError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            WardrobeItemSerializer(
                item,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request, item_id: int):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            item = WardrobeService.update_item(
                request.user,
                item_id,
                data=serializer.validated_data,
            )
        except WardrobeError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            WardrobeItemSerializer(
                item,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request, item_id: int):
        deleted = WardrobeService.delete_item(request.user, item_id)

        if not deleted:
            return Response(
                {"detail": "Р•Р»РµРјРµРЅС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)
