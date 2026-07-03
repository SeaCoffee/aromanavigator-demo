from django.conf import settings
from django.db import models
from django.db.models import Q

from core.choises.activity_choises import ActivityVerb
from core.models import BaseModel
from apps.activity.managers import ActivityEventManager

class ActivityEventModel(BaseModel):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="activity_events",
    )
    verb = models.CharField(max_length=120, choices=ActivityVerb.choices)

    target_app = models.CharField(max_length=80, blank=True)
    target_model = models.CharField(max_length=80, blank=True)
    target_id = models.PositiveIntegerField(null=True, blank=True)

    payload = models.JSONField(default=dict, blank=True)
    is_private = models.BooleanField(default=False)

    objects = ActivityEventManager()

    class Meta:
        db_table = "activity_event"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["actor", "created_at"], name="idx_activity_actor_created"),
            models.Index(fields=["created_at"], name="idx_activity_created"),
            models.Index(fields=["verb", "created_at"], name="idx_activity_verb_created"),
            models.Index(fields=["target_app", "target_model", "target_id"], name="idx_activity_target_triplet"),
            models.Index(fields=["is_private", "created_at"], name="idx_activity_public_created"),
            models.Index(
                fields=["target_app", "target_model", "target_id", "created_at"],
                name="idx_activity_target_created",
            ),
        ]
        constraints = [
            models.CheckConstraint(
                name="activity_target_all_or_none",
                condition=(
                    (
                        Q(target_app="")
                        & Q(target_model="")
                        & Q(target_id__isnull=True)
                    )
                    |
                    (
                        ~Q(target_app="")
                        & ~Q(target_model="")
                        & Q(target_id__isnull=False)
                    )
                ),
            )
        ]

    def __str__(self) -> str:
        return f"{self.actor_id} {self.verb} {self.target_app}.{self.target_model}:{self.target_id}"
