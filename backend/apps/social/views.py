from __future__ import annotations

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import DestroyAPIView, GenericAPIView, ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.social.filters import SubscriptionFilterSerializer
from apps.social.models import SubscriptionModel
from apps.social.selectors import (
    exclude_blocked_for_viewer,
    filtered_subscriptions_for_user,
    followers_for_user,
    following_for_user,
    social_state_for_user,
)
from apps.social.serializers import (
    BlockToggleResponseSerializer,
    FollowToggleResponseSerializer,
    SocialStateSerializer,
    SocialUserSerializer,
    SubscribeSerializer,
    SubscriptionOutSerializer,
    UnsubscribeSerializer,
)
from apps.social.social_service import SocialError, SocialService, SubscriptionService
from apps.users.permissions import IsAuthenticated, IsNotSuspended


User = get_user_model()


class FollowToggleView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = FollowToggleResponseSerializer

    def post(self, request, user_id: int):
        target = get_object_or_404(User, pk=user_id)

        try:
            _, _, payload = SocialService.follow_toggle(
                actor=request.user,
                target=target,
            )
        except SocialError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(payload, status=status.HTTP_200_OK)


class FollowersListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SocialUserSerializer

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        qs = followers_for_user(user_id)

        if self.request.user.is_authenticated:
            return exclude_blocked_for_viewer(qs, self.request.user)

        return qs


class FollowingListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SocialUserSerializer

    def get_queryset(self):
        user_id = self.kwargs["user_id"]
        qs = following_for_user(user_id)

        if self.request.user.is_authenticated:
            return exclude_blocked_for_viewer(qs, self.request.user)

        return qs


class BlockToggleView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = BlockToggleResponseSerializer

    def post(self, request, user_id: int):
        target = get_object_or_404(User, pk=user_id)

        try:
            _, _, payload = SocialService.block_toggle(
                actor=request.user,
                target=target,
            )
        except SocialError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(payload, status=status.HTTP_200_OK)


class SubscribeView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = SubscribeSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target = serializer.validated_data["target"]

        try:
            subscription, created = SubscriptionService.subscribe(
                user=request.user,
                target=target,
            )
        except SocialError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = SubscriptionOutSerializer(
            subscription,
            context=self.get_serializer_context(),
        ).data

        return Response(
            data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class UnsubscribeView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = UnsubscribeSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target = serializer.validated_data["target"]

        try:
            SubscriptionService.unsubscribe(
                user=request.user,
                target=target,
            )
        except SocialError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class SubscriptionListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = SubscriptionOutSerializer

    def get_queryset(self):
        filter_serializer = SubscriptionFilterSerializer(
            data=self.request.query_params,
        )
        filter_serializer.is_valid(raise_exception=True)

        return filtered_subscriptions_for_user(
            user=self.request.user,
            filters=filter_serializer.validated_data,
        )


class SubscriptionDeleteView(DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SubscriptionModel.objects.filter(user=self.request.user)


class SocialStateView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = SocialStateSerializer

    def get(self, request, user_id: int):
        target = get_object_or_404(User, pk=user_id)

        data = social_state_for_user(
            actor=request.user,
            target=target,
        )

        return Response(
            self.get_serializer(data).data,
            status=status.HTTP_200_OK,
        )
