from __future__ import annotations

from django.contrib import admin
from django.contrib.auth import get_user_model

from apps.users.models import ProfileModel, UserStatsModel, UserSuspension


UserModel = get_user_model()


@admin.register(UserModel)
class UserModelAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "email",
        "is_active",
        "is_staff",
        "is_seller",
        "role",
        "created_at",
    )
    list_filter = (
        "is_active",
        "is_staff",
        "is_seller",
        "role",
        "suspended_indefinitely",
    )
    search_fields = (
        "email",
        "profile__display_name",
        "profile__name",
    )
    ordering = ("-created_at",)


@admin.register(ProfileModel)
class ProfileModelAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "display_name", "name", "region", "created_at")
    search_fields = ("display_name", "name", "user__email")
    ordering = ("display_name",)


@admin.register(UserStatsModel)
class UserStatsModelAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "forum_topics_count",
        "forum_comments_count",
        "likes_given_count",
        "likes_received_count",
    )
    search_fields = ("user__email", "user__profile__display_name")
    ordering = ("-updated_at",)


@admin.register(UserSuspension)
class UserSuspensionAdmin(admin.ModelAdmin):
    list_display = ("id", "target", "admin", "started_at", "until", "ended_at")
    list_filter = ("ended_at", "until")
    search_fields = ("target__email", "admin__email", "reason")
    ordering = ("-started_at",)
