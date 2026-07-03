from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Q
from django.utils import timezone

from core.models import BaseModel


class NotificationAnnouncementKind(models.TextChoices):
    RULES = "rules", "РќРѕРІС– РїСЂР°РІРёР»Р°"
    MAINTENANCE = "maintenance", "РўРµС…РЅС–С‡РЅС– СЂРѕР±РѕС‚Рё"
    PROMO = "promo", "РђРєС†С–СЏ"
    SITE_UPDATE = "site_update", "РћРЅРѕРІР»РµРЅРЅСЏ СЃР°Р№С‚Сѓ"
    OTHER = "other", "РћРіРѕР»РѕС€РµРЅРЅСЏ"


class NotificationModel(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    verb = models.CharField(max_length=120)

    actor_ct = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        related_name="+",
    )
    actor_id = models.PositiveIntegerField()
    actor = GenericForeignKey("actor_ct", "actor_id")

    target_ct = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="+",
    )
    target_id = models.PositiveIntegerField(null=True, blank=True)
    target = GenericForeignKey("target_ct", "target_id")

    activity_event = models.ForeignKey(
        "activity.ActivityEventModel",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notifications",
    )

    payload = models.JSONField(default=dict, blank=True)

    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "user_notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "is_read", "created_at"], name="idx_notif_user_read_time"),
            models.Index(fields=["user", "created_at"], name="idx_notif_user_time"),
            models.Index(fields=["user", "is_read"], name="idx_notif_user_read"),
            models.Index(fields=["verb", "created_at"], name="idx_notif_verb_created"),
            models.Index(fields=["actor_ct", "actor_id"], name="idx_notif_actor"),
            models.Index(fields=["target_ct", "target_id"], name="idx_notif_target"),
            models.Index(fields=["activity_event"], name="idx_notif_activity_event"),
        ]
        constraints = [
            models.CheckConstraint(
                name="notification_target_all_or_none",
                condition=(
                    (
                        Q(target_ct__isnull=True)
                        & Q(target_id__isnull=True)
                    )
                    |
                    (
                        Q(target_ct__isnull=False)
                        & Q(target_id__isnull=False)
                    )
                ),
            ),
        ]

    def __str__(self):
        return f"Notification<{self.user_id}: {self.verb}>"


class NotificationAnnouncementModel(BaseModel):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="notification_announcements",
    )
    kind = models.CharField(
        max_length=32,
        choices=NotificationAnnouncementKind.choices,
        default=NotificationAnnouncementKind.OTHER,
        db_index=True,
    )
    title = models.CharField(max_length=180)
    body = models.TextField(max_length=2000)
    is_active = models.BooleanField(default=True, db_index=True)
    starts_at = models.DateTimeField(null=True, blank=True, db_index=True)
    ends_at = models.DateTimeField(null=True, blank=True, db_index=True)

    class Meta:
        db_table = "notification_announcement"
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(
                fields=["is_active", "starts_at", "ends_at"],
                name="idx_notif_ann_active_window",
            ),
            models.Index(fields=["kind", "created_at"], name="idx_notif_ann_kind_time"),
        ]

    def __str__(self):
        return f"{self.get_kind_display()}: {self.title}"

    @property
    def is_current(self) -> bool:
        now = timezone.now()

        if not self.is_active:
            return False

        if self.starts_at and self.starts_at > now:
            return False

        if self.ends_at and self.ends_at < now:
            return False

        return True


class NotificationAnnouncementReadModel(BaseModel):
    announcement = models.ForeignKey(
        NotificationAnnouncementModel,
        on_delete=models.CASCADE,
        related_name="reads",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="read_notification_announcements",
    )
    read_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = "notification_announcement_read"
        ordering = ["-read_at", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["announcement", "user"],
                name="uq_notif_ann_read_user_once",
            ),
        ]
        indexes = [
            models.Index(fields=["user", "read_at"], name="idx_notif_ann_read_user"),
            models.Index(
                fields=["announcement", "user"],
                name="idx_notif_ann_read_pair",
            ),
        ]
