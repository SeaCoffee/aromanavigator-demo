from django.contrib.contenttypes.models import ContentType
from django.db import models


class PerfumeFavoriteQuerySet(models.QuerySet):
    def for_user(self, user):
        return self.filter(user=user)

    def for_target(self, user, target):
        ct = ContentType.objects.get_for_model(
            type(target),
            for_concrete_model=False,
        )
        return self.filter(
            user=user,
            content_type=ct,
            object_id=getattr(target, "pk", None),
        )


class PerfumeFavoriteManager(models.Manager):
    def get_queryset(self):
        return PerfumeFavoriteQuerySet(self.model, using=self._db)

    def get_or_create_for_target(self, user, target):
        ct = ContentType.objects.get_for_model(
            type(target),
            for_concrete_model=False,
        )
        return self.get_queryset().get_or_create(
            user=user,
            content_type=ct,
            object_id=target.pk,
        )

    def filter_for_target(self, user, target):
        return self.get_queryset().for_target(user, target)
