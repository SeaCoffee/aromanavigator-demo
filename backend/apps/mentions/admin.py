from __future__ import annotations

from django.contrib import admin

from .models import MentionModel


@admin.register(MentionModel)
class MentionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "content_type",
        "object_id",
        "created_at",
    )
    list_filter = ("content_type",)
    search_fields = (
        "user__email",
        "user__profile__display_name",
        "object_id",
    )
    raw_id_fields = ("user", "content_type")
    ordering = ("-created_at",)
