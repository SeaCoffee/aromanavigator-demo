from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from core.models import BaseModel

class MentionModel(BaseModel):
    """
    РЈРїРѕРјРёРЅР°РЅРёРµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РІ Р»СЋР±РѕРј РѕР±СЉРµРєС‚Рµ (comment, post, topic Рё С‚.Рґ.)
    """

    class Meta:
        db_table = "mention"
        constraints = [
            models.UniqueConstraint(
                fields=["content_type", "object_id", "user"],
                name="uq_mention_target_user",
            ),
        ]
        indexes = [
            models.Index(fields=["user", "created_at"], name="idx_mention_user_time"),
            models.Index(fields=["content_type", "object_id"], name="idx_mention_target"),
        ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="mentions")

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    def __str__(self):
        return f"@{self.user_id} -> {self.content_type_id}:{self.object_id}"
