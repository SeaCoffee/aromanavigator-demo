from __future__ import annotations

from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import Q


class FollowQuerySet(models.QuerySet):
    def by_pair(self, *, follower, followee):
        return self.filter(follower=follower, followee=followee)

    def for_follower(self, user):
        return self.filter(follower=user)

    def for_followee(self, user):
        return self.filter(followee=user)


class FollowManager(models.Manager.from_queryset(FollowQuerySet)):
    pass


class BlockQuerySet(models.QuerySet):
    def by_pair(self, *, blocker, blocked):
        return self.filter(blocker=blocker, blocked=blocked)

    def relation_between(self, *, actor, target):
        return self.filter(
            Q(blocker=actor, blocked=target)
            | Q(blocker=target, blocked=actor)
        )

    def blocks_from(self, user):
        return self.filter(blocker=user)

    def blocks_to(self, user):
        return self.filter(blocked=user)


class BlockManager(models.Manager.from_queryset(BlockQuerySet)):
    pass


class SubscriptionQuerySet(models.QuerySet):
    def for_user(self, user):
        return self.filter(user=user).select_related("content_type")

    def for_target(self, target):
        ct = ContentType.objects.get_for_model(
            target,
            for_concrete_model=False,
        )

        return self.filter(content_type=ct, object_id=target.pk)

    def for_target_reference(self, *, app: str, model: str, object_id: int):
        ct = ContentType.objects.filter(
            app_label=app,
            model=model,
        ).first()

        if not ct:
            return self.none()

        return self.filter(content_type=ct, object_id=object_id)

    def ordered_newest(self):
        return self.order_by("-created_at")


class SubscriptionManager(models.Manager.from_queryset(SubscriptionQuerySet)):
    pass
