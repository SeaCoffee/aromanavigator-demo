# apps/comments/models.py
from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.db.models import Q

from core.models import BaseModel

class CommentModel(BaseModel):
    """
    РЈРЅРёРІРµСЂСЃР°Р»СЊРЅС‹Р№ РєРѕРјРјРµРЅС‚Р°СЂРёР№ Рє Р»СЋР±РѕРјСѓ РѕР±СЉРµРєС‚Сѓ.
    РџРѕРґРґРµСЂР¶РёРІР°РµС‚ РѕС‚РІРµС‚С‹ (parent).
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="comments")

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
    )
    object_id = models.PositiveBigIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="replies",
    )

    body = models.TextField()
    is_official = models.BooleanField(default=False)

    is_deleted = models.BooleanField(default=False)

    likes_count = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return f"comment:{self.id} user:{self.user_id}"



    class Meta:
        db_table = "comment"
        ordering = ("created_at", "id")
        indexes = [
            models.Index(
                fields=["content_type", "object_id", "created_at"],
                name="idx_comment_target_time",
            ),
            models.Index(
                fields=["user", "created_at"],
                name="idx_comment_user_time",
            ),
            models.Index(
                fields=["parent", "created_at"],
                name="idx_comment_parent_time",
            ),
            models.Index(
                fields=["likes_count"],
                name="idx_comment_likes",
            ),
            models.Index(
                fields=["is_deleted", "created_at"],
                name="idx_comment_deleted_time",
            ),
        ]
