from __future__ import annotations

from django.contrib import admin

from .models import TagModel, TaggedItemModel


@admin.register(TagModel)
class TagAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "created_at", "updated_at")
    search_fields = ("code",)
    ordering = ("code",)


@admin.register(TaggedItemModel)
class TaggedItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "tag",
        "content_type",
        "object_id",
        "created_at",
    )
    list_filter = ("content_type",)
    search_fields = ("tag__code", "object_id")
    raw_id_fields = ("tag", "content_type")
    ordering = ("-created_at",)
