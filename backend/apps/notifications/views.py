from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.generics import (
    DestroyAPIView,
    GenericAPIView,
    ListAPIView,
    ListCreateAPIView,
    UpdateAPIView,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.notifications.filters import NotificationFilter
from apps.notifications.models import NotificationAnnouncementModel
from apps.notifications.notifications_service import NotificationsService
from apps.notifications.selectors import (
    admin_announcements,
    announcements_for_user,
    notifications_for_user,
)
from apps.notifications.serializers import (
    NotificationAnnouncementInputSerializer,
    NotificationAnnouncementSerializer,
    NotificationSerializer,
    NotificationUnreadCountSerializer,
)
from apps.users.permissions import IsNotSuspended, IsStaffRole
from core.pagination import PagePagination


class NotificationListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer
    pagination_class = PagePagination
    filter_backends = [DjangoFilterBackend]
    filterset_class = NotificationFilter

    def get_queryset(self):
        return notifications_for_user(self.request.user)


class NotificationUnreadCountView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationUnreadCountSerializer

    def get(self, request):
        return Response(
            {"unread_count": NotificationsService.get_unread_count(request.user)},
            status=status.HTTP_200_OK,
        )


class NotificationReadView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        updated = NotificationsService.mark_read(request.user, pk)

        if not updated:
            return Response(
                {"detail": "РЎРїРѕРІС–С‰РµРЅРЅСЏ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({"updated": updated}, status=status.HTTP_200_OK)


class NotificationReadAllView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        updated = NotificationsService.mark_all_read(request.user)

        return Response({"updated": updated}, status=status.HTTP_200_OK)


class NotificationDeleteView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        deleted = NotificationsService.delete_notification(
            user=request.user,
            notification_id=pk,
        )

        if not deleted:
            return Response(
                {"detail": "РЎРїРѕРІС–С‰РµРЅРЅСЏ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationDeleteReadView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        deleted = NotificationsService.delete_read(request.user)

        return Response({"deleted": deleted}, status=status.HTTP_200_OK)


class NotificationRecomputeUnreadCountView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        count = NotificationsService.recompute_unread_count(request.user)

        return Response({"unread_count": count}, status=status.HTTP_200_OK)


class NotificationAnnouncementListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationAnnouncementSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        return announcements_for_user(self.request.user)


class NotificationAnnouncementReadView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        updated = NotificationsService.mark_announcement_read(request.user, pk)

        if not updated:
            return Response(
                {"detail": "РћРіРѕР»РѕС€РµРЅРЅСЏ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({"updated": updated}, status=status.HTTP_200_OK)


class AdminNotificationAnnouncementListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    pagination_class = PagePagination

    def get_queryset(self):
        return admin_announcements()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return NotificationAnnouncementInputSerializer

        return NotificationAnnouncementSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)

        return Response(
            NotificationAnnouncementSerializer(
                serializer.instance,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_201_CREATED,
        )


class AdminNotificationAnnouncementUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = NotificationAnnouncementInputSerializer
    queryset = NotificationAnnouncementModel.objects.all()

    def patch(self, request, *args, **kwargs):
        obj = self.get_object()
        serializer = self.get_serializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            NotificationAnnouncementSerializer(
                obj,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )


class AdminNotificationAnnouncementDeleteView(DestroyAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    queryset = NotificationAnnouncementModel.objects.all()
