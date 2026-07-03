# apps/activity/views.py

from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated

from apps.activity import selectors
from apps.activity.filters import ActivityEventFilter
from apps.activity.models import ActivityEventModel
from apps.activity.serializers import ActivityEventSerializer
from apps.users.models import ProfileModel
from core.pagination import PagePagination


User = get_user_model()


class ActivityListMixin:
    serializer_class = ActivityEventSerializer
    pagination_class = PagePagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ActivityEventFilter
    ordering_fields = ["created_at", "updated_at", "verb"]
    ordering = ["-created_at"]


class FeedView(ActivityListMixin, ListAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return selectors.feed_for(self.request.user)


class PublicFeedView(ActivityListMixin, ListAPIView):
    permission_classes = [AllowAny]

    def get_queryset(self):
        return selectors.public_feed(self.request.user)


class UserActivityByDisplayNameView(ActivityListMixin, ListAPIView):
    permission_classes = [AllowAny]

    def get_queryset(self):
        display_name = (self.kwargs.get("display_name") or "").strip()

        if not display_name:
            return ActivityEventModel.objects.none()

        profile = (
            ProfileModel.objects
            .select_related("user")
            .filter(display_name_ci=display_name.casefold())
            .first()
        )

        if profile is None:
            return ActivityEventModel.objects.none()

        return selectors.user_public_feed(profile.user_id, self.request.user)


class UserActivityView(ActivityListMixin, ListAPIView):
    permission_classes = [AllowAny]

    def get_queryset(self):
        return selectors.user_public_feed(
            int(self.kwargs["user_id"]),
            self.request.user,
        )


class TargetActivityView(ActivityListMixin, ListAPIView):
    permission_classes = [AllowAny]

    def get_queryset(self):
        return selectors.target_public_feed(
            app=self.kwargs["app"],
            model=self.kwargs["model"],
            obj_id=int(self.kwargs["obj_id"]),
            viewer=self.request.user,
        )
