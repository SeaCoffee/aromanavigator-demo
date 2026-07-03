from django.contrib import admin

from apps.notifications.models import (
    NotificationAnnouncementModel,
    NotificationAnnouncementReadModel,
    NotificationModel,
)


@admin.register(NotificationModel)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "verb", "is_read", "created_at")
    list_filter = ("is_read", "verb", "created_at")
    search_fields = ("user__email", "verb")
    readonly_fields = ("created_at", "updated_at", "read_at")


@admin.register(NotificationAnnouncementModel)
class NotificationAnnouncementAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "kind", "is_active", "starts_at", "ends_at", "created_at")
    list_filter = ("kind", "is_active", "created_at")
    search_fields = ("title", "body")
    readonly_fields = ("created_at", "updated_at")


@admin.register(NotificationAnnouncementReadModel)
class NotificationAnnouncementReadAdmin(admin.ModelAdmin):
    list_display = ("id", "announcement", "user", "read_at")
    search_fields = ("announcement__title", "user__email")
    readonly_fields = ("created_at", "updated_at", "read_at")
