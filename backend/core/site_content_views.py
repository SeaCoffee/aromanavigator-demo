from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.users.permissions import IsNotSuspended, IsStaffRole
from core.models import (
    FeedbackMessageModel,
    SiteContactSettingsModel,
    SiteFaqModel,
    SitePageModel,
)
from core.pagination import PagePagination
from core.site_content_serializers import (
    FeedbackAdminSerializer,
    FeedbackAdminUpdateSerializer,
    FeedbackCreateSerializer,
    SiteContactSettingsSerializer,
    SiteFaqSerializer,
    SitePageSerializer,
)


def client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()
    return request.META.get("REMOTE_ADDR") or None


class PublicSiteContentView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        pages = SitePageModel.objects.filter(is_published=True).only(
            "id", "slug", "title", "is_published", "updated_at"
        )
        return Response(
            {
                "contacts": SiteContactSettingsSerializer(
                    SiteContactSettingsModel.load()
                ).data,
                "pages": SitePageSerializer(pages, many=True).data,
            }
        )


class PublicSitePageDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = SitePageSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return SitePageModel.objects.filter(is_published=True)


class PublicFaqListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = SiteFaqSerializer
    pagination_class = None

    def get_queryset(self):
        return SiteFaqModel.objects.filter(is_active=True)


class FeedbackCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = FeedbackCreateSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "feedback"

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(user=user, ip_address=client_ip(self.request))


class AdminSiteContactSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]

    def get(self, request):
        return Response(
            SiteContactSettingsSerializer(SiteContactSettingsModel.load()).data
        )

    def patch(self, request):
        obj = SiteContactSettingsModel.load()
        serializer = SiteContactSettingsSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AdminSitePageListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = SitePageSerializer
    pagination_class = None
    queryset = SitePageModel.objects.all()


class AdminSitePageDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = SitePageSerializer
    lookup_field = "slug"
    queryset = SitePageModel.objects.all()


class AdminFaqListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = SiteFaqSerializer
    pagination_class = None
    queryset = SiteFaqModel.objects.all()


class AdminFaqDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = SiteFaqSerializer
    queryset = SiteFaqModel.objects.all()


class AdminFeedbackListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = FeedbackAdminSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        queryset = FeedbackMessageModel.objects.select_related("user")
        status_value = self.request.query_params.get("status")
        search = self.request.query_params.get("search", "").strip()

        if status_value:
            queryset = queryset.filter(status=status_value)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(email__icontains=search)
                | Q(subject__icontains=search)
                | Q(message__icontains=search)
            )

        return queryset


class AdminFeedbackDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    queryset = FeedbackMessageModel.objects.select_related("user")

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return FeedbackAdminUpdateSerializer
        return FeedbackAdminSerializer

    def update(self, request, *args, **kwargs):
        obj = self.get_object()
        serializer = self.get_serializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(FeedbackAdminSerializer(obj).data, status=status.HTTP_200_OK)
