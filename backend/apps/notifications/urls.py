from django.urls import path

from apps.notifications.views import (
    AdminNotificationAnnouncementDeleteView,
    AdminNotificationAnnouncementListCreateView,
    AdminNotificationAnnouncementUpdateView,
    NotificationAnnouncementListView,
    NotificationAnnouncementReadView,
    NotificationDeleteReadView,
    NotificationDeleteView,
    NotificationListView,
    NotificationReadAllView,
    NotificationReadView,
    NotificationRecomputeUnreadCountView,
    NotificationUnreadCountView,
)

urlpatterns = [
    path("", NotificationListView.as_view(), name="notifications-list"),
    path("unread-count", NotificationUnreadCountView.as_view(), name="notifications-unread-count"),

    path("announcements", NotificationAnnouncementListView.as_view(), name="notifications-announcements"),
    path("announcements/<int:pk>/read", NotificationAnnouncementReadView.as_view(), name="notifications-announcement-read"),

    path("admin/announcements", AdminNotificationAnnouncementListCreateView.as_view(), name="notifications-admin-announcements"),
    path("admin/announcements/<int:pk>", AdminNotificationAnnouncementUpdateView.as_view(), name="notifications-admin-announcement-update"),
    path("admin/announcements/<int:pk>/delete", AdminNotificationAnnouncementDeleteView.as_view(), name="notifications-admin-announcement-delete"),

    path("read-all", NotificationReadAllView.as_view(), name="notifications-read-all"),
    path("read", NotificationDeleteReadView.as_view(), name="notifications-delete-read"),
    path("recompute-unread-count", NotificationRecomputeUnreadCountView.as_view(), name="notifications-recompute-unread-count"),

    path("<int:pk>/read", NotificationReadView.as_view(), name="notifications-read"),
    path("<int:pk>", NotificationDeleteView.as_view(), name="notifications-delete"),
]
