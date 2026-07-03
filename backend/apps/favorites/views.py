from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.generics import DestroyAPIView, GenericAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.favorites.filters import FavoriteFilter
from apps.favorites.models import PerfumeFavoriteModel
from apps.favorites.serializers import (
    PerfumeFavoriteCreateSerializer,
    PerfumeFavoriteSerializer,
    PerfumeFavoriteTargetSerializer,
    PerfumeFavoriteToggleInputSerializer,
    PerfumeFavoriteToggleResponseSerializer,
)
from apps.favorites.favorite_service import FavoriteService
from apps.users.permissions import IsNotSuspended
from core.pagination import PagePagination


class PerfumeFavoriteCreateView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = PerfumeFavoriteCreateSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target = serializer.validated_data["target"]

        favorite, created = FavoriteService.add_to_favorites(
            user=request.user,
            target=target,
        )

        response_status = (
            status.HTTP_201_CREATED
            if created
            else status.HTTP_200_OK
        )

        return Response(
            PerfumeFavoriteSerializer(
                favorite,
                context=self.get_serializer_context(),
            ).data,
            status=response_status,
        )


class PerfumeFavoriteListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PerfumeFavoriteSerializer
    pagination_class = PagePagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = FavoriteFilter

    def get_queryset(self):
        return (
            PerfumeFavoriteModel.objects
            .filter(user=self.request.user)
            .select_related("content_type")
            .order_by("-created_at")
        )


class PerfumeFavoriteDeleteView(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PerfumeFavoriteSerializer
    lookup_field = "pk"

    def get_queryset(self):
        return PerfumeFavoriteModel.objects.filter(
            user=self.request.user,
        ).select_related("content_type")

    def destroy(self, request, *args, **kwargs):
        favorite = self.get_object()

        FavoriteService.remove_favorite(favorite=favorite)

        return Response(status=status.HTTP_204_NO_CONTENT)


class PerfumeFavoriteDeleteByTargetView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PerfumeFavoriteTargetSerializer

    def delete(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target = serializer.validated_data["target"]

        deleted = FavoriteService.remove_from_favorites(
            user=request.user,
            target=target,
        )

        if not deleted:
            return Response(
                {"detail": "РћР±'С”РєС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ РІ РѕР±СЂР°РЅРѕРјСѓ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class PerfumeFavoriteToggleView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = PerfumeFavoriteToggleInputSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target = serializer.validated_data["target"]

        favorited, favorite = FavoriteService.toggle_favorite(
            user=request.user,
            target=target,
        )

        output = PerfumeFavoriteToggleResponseSerializer(
            {
                "favorited": favorited,
                "favorite": favorite,
            },
            context=self.get_serializer_context(),
        )

        return Response(output.data, status=status.HTTP_200_OK)
