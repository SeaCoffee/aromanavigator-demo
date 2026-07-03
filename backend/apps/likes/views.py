from __future__ import annotations

from rest_framework import status
from rest_framework.generics import DestroyAPIView, GenericAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.permissions import IsNotSuspended

from .models import LikeModel
from .selectors import build_like_targets_map, user_likes_queryset
from .serializers import (
    LikeCreateSerializer,
    LikeSerializer,
    LikeTargetSerializer,
    LikeToggleSerializer,
)
from .services import LikeService


class LikeListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LikeSerializer

    def get_queryset(self):
        return user_likes_queryset(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        likes = list(page if page is not None else queryset)

        serializer = self.get_serializer(
            likes,
            many=True,
            context={
                **self.get_serializer_context(),
                "like_targets_map": build_like_targets_map(likes),
            },
        )

        if page is not None:
            return self.get_paginated_response(serializer.data)

        return Response(serializer.data)


class LikeCreateView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = LikeCreateSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target = serializer.validated_data["target"]

        like, created = LikeService.create_like(
            user=request.user,
            target=target,
        )

        response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK

        return Response(
            LikeSerializer(
                like,
                context={
                    **self.get_serializer_context(),
                    "like_targets_map": {
                        (like.content_type_id, like.object_id): target,
                    },
                },
            ).data,
            status=response_status,
        )


class LikeDeleteView(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LikeSerializer

    def get_queryset(self):
        return (
            LikeModel.objects
            .filter(user=self.request.user)
            .select_related("content_type")
        )

    def destroy(self, request, *args, **kwargs):
        like = self.get_object()

        LikeService.delete_like(
            like=like,
            actor=request.user,
        )

        return Response(status=status.HTTP_204_NO_CONTENT)


class LikeDeleteByTargetView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LikeTargetSerializer

    def post(self, request, *args, **kwargs):
        """
        POST РІРјРµСЃС‚Рѕ DELETE body, РїРѕС‚РѕРјСѓ С‡С‚Рѕ DELETE СЃ body С‡Р°СЃС‚Рѕ РЅРµСѓРґРѕР±РµРЅ
        РґР»СЏ fetch/proxy/client wrappers.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target = serializer.validated_data["target"]

        deleted = LikeService.delete_like_by_target(
            user=request.user,
            target=target,
        )

        if not deleted:
            return Response(
                {"detail": "Р›Р°Р№Рє РЅРµ Р·РЅР°Р№РґРµРЅРѕ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class LikeToggleView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = LikeTargetSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target = serializer.validated_data["target"]

        liked, like = LikeService.toggle_like(
            user=request.user,
            target=target,
        )

        output_serializer = LikeToggleSerializer(
            {
                "liked": liked,
                "like": like,
            },
            context={
                **self.get_serializer_context(),
                "like_targets_map": {
                    (like.content_type_id, like.object_id): target,
                } if like else {},
            },
        )

        return Response(
            output_serializer.data,
            status=status.HTTP_200_OK,
        )
