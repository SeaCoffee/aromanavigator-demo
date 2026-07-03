# apps/notifications/selectors.py

from django.db.models import Exists, OuterRef, Q, Value
from django.db.models.fields import BooleanField
from django.utils import timezone

from apps.notifications.models import (
    NotificationAnnouncementModel,
    NotificationAnnouncementReadModel,
    NotificationModel,
)


def notifications_for_user(user):
    return (
        NotificationModel.objects
        .filter(user=user)
        .select_related(
            "actor_ct",
            "target_ct",
            "activity_event",
        )
        .prefetch_related(
            "actor",
            "target",
        )
        .order_by("-created_at")
    )


def unread_notifications_for_user(user):
    return notifications_for_user(user).filter(is_read=False)


def active_announcements_base():
    now = timezone.now()

    return NotificationAnnouncementModel.objects.filter(
        is_active=True,
    ).filter(
        Q(starts_at__isnull=True) | Q(starts_at__lte=now),
        Q(ends_at__isnull=True) | Q(ends_at__gte=now),
    )


def announcements_for_user(user):
    if not user or not getattr(user, "is_authenticated", False):
        return (
            active_announcements_base()
            .annotate(is_read=Value(False, output_field=BooleanField()))
            .order_by("-created_at", "-id")
        )

    read_qs = NotificationAnnouncementReadModel.objects.filter(
        announcement_id=OuterRef("pk"),
        user_id=user.id,
    )

    return (
        active_announcements_base()
        .annotate(is_read=Exists(read_qs))
        .order_by("-created_at", "-id")
    )


def unread_announcements_count_for_user(user) -> int:
    if not user or not getattr(user, "is_authenticated", False):
        return 0

    return (
        active_announcements_base()
        .exclude(reads__user_id=user.id)
        .count()
    )


def admin_announcements():
    return (
        NotificationAnnouncementModel.objects
        .select_related("created_by")
        .order_by("-created_at", "-id")
    )
