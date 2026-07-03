from __future__ import annotations

from django.contrib import admin
from django.contrib.admin.sites import AlreadyRegistered
from django.contrib.contenttypes.models import ContentType


class ContentTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "app_label", "model")
    list_filter = ("app_label",)
    search_fields = ("app_label", "model")
    ordering = ("app_label", "model")


try:
    admin.site.register(ContentType, ContentTypeAdmin)
except AlreadyRegistered:
    pass
