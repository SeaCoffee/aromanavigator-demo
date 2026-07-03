from __future__ import annotations

from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from apps.social.managers import BlockManager, FollowManager, SubscriptionManager
from core.models import BaseModel


class FollowModel(BaseModel):
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="following",
    )
    followee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="followers",
    )

    objects = FollowManager()

    class Meta:
        db_table = "user_follow"
        constraints = [
            models.UniqueConstraint(
                fields=["follower", "followee"],
                name="uniq_follow_pair",
            ),
            models.CheckConstraint(
                condition=~models.Q(follower=models.F("followee")),
                name="no_self_follow",
            ),
        ]
        indexes = [
            models.Index(fields=["followee"], name="idx_follow_followee"),
            models.Index(fields=["follower"], name="idx_follow_follower"),
        ]


class BlockModel(BaseModel):
    blocker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="blocks_out",
    )
    blocked = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="blocks_in",
    )

    objects = BlockManager()

    class Meta:
        db_table = "user_block"
        constraints = [
            models.UniqueConstraint(
                fields=["blocker", "blocked"],
                name="uniq_block_pair",
            ),
            models.CheckConstraint(
                condition=~models.Q(blocker=models.F("blocked")),
                name="no_self_block",
            ),
        ]
        indexes = [
            models.Index(fields=["blocked"], name="idx_block_blocked"),
            models.Index(fields=["blocker"], name="idx_block_blocker"),
        ]


class SubscriptionModel(BaseModel):
    """
    РџС–РґРїРёСЃРєР° РєРѕСЂРёСЃС‚СѓРІР°С‡Р° РЅР° Р±СѓРґСЊ-СЏРєРёР№ РґРѕР·РІРѕР»РµРЅРёР№ РѕР±КјС”РєС‚.
    РќР°РїСЂРёРєР»Р°Рґ: forum topic, forum section.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
    )
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey("content_type", "object_id")

    objects = SubscriptionManager()

    class Meta:
        db_table = "user_subscription"
        constraints = [
            models.UniqueConstraint(
                fields=["user", "content_type", "object_id"],
                name="uq_sub_user_target",
            ),
        ]
        indexes = [
            models.Index(fields=["user", "created_at"], name="idx_sub_user_time"),
            models.Index(fields=["content_type", "object_id"], name="idx_sub_target"),
        ]

    def __str__(self):
        return f"Sub<{self.user_id} -> {self.content_type_id}:{self.object_id}>"
