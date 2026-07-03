from django.db import models


class ActivityEventQuerySet(models.QuerySet):
    def public(self):
        return self.filter(is_private=False)

    def private(self):
        return self.filter(is_private=True)

    def by_actor(self, user_id: int):
        return self.filter(actor_id=user_id)

    def for_target(self, app: str, model: str, obj_id: int):
        return self.filter(
            target_app=app,
            target_model=model,
            target_id=obj_id,
        )

    def by_verb(self, verb: str):
        return self.filter(verb=verb)


class ActivityEventManager(models.Manager):
    def get_queryset(self):
        return ActivityEventQuerySet(self.model, using=self._db)

    def public(self):
        return self.get_queryset().public()

    def private(self):
        return self.get_queryset().private()

    def by_actor(self, user_id: int):
        return self.get_queryset().by_actor(user_id)

    def for_target(self, app: str, model: str, obj_id: int):
        return self.get_queryset().for_target(app, model, obj_id)

    def by_verb(self, verb: str):
        return self.get_queryset().by_verb(verb)
