from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Index, UniqueConstraint

from core.models import BaseModel

class LikeModel(BaseModel):
    """
    РЈРЅРёРІРµСЂСЃР°Р»СЊРЅС‹Р№ Р»Р°Р№Рє Рє СЂР°Р·СЂРµС€С‘РЅРЅС‹Рј РѕР±СЉРµРєС‚Р°Рј.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="likes")

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    class Meta:
        db_table = "likes"
        ordering = ["-created_at"]
        constraints = [
            UniqueConstraint(
                fields=("user", "content_type", "object_id"),
                name="uq_like_user_target",
            ),
        ]
        indexes = [
            Index(fields=["user", "created_at"], name="idx_like_user_time"),
            Index(fields=["content_type", "object_id"], name="idx_like_target"),
        ]

    def __str__(self):
        return f"{self.user_id} в†’ {self.content_type_id}:{self.object_id}"
