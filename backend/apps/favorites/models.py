from django.db import models
from django.db.models import UniqueConstraint, Index
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.conf import settings

from .managers import PerfumeFavoriteManager
from core.models import BaseModel

class PerfumeFavoriteModel(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites",
        help_text="РљРѕСЂРёСЃС‚СѓРІР°С‡, СЏРєРёР№ РґРѕРґР°РІ Сѓ РІРёР±СЂР°РЅРµ"
    )
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    objects = PerfumeFavoriteManager()

    class Meta:
        verbose_name = "РЈР»СЋР±Р»РµРЅРёР№ РїР°СЂС„СѓРј"
        verbose_name_plural = "РЈР»СЋР±Р»РµРЅС– РїР°СЂС„СѓРјРё"
        ordering = ["-created_at"]
        constraints = [
            UniqueConstraint(fields=("user", "content_type", "object_id"), name="uq_fav_user_target"),
        ]
        indexes = [
            Index(fields=["user", "created_at"], name="idx_fav_user_time"),
            Index(fields=["content_type", "object_id"], name="idx_fav_target"),
        ]

    def __str__(self):
        return f"{self.user} в†’ {self.content_type} #{self.object_id}"
