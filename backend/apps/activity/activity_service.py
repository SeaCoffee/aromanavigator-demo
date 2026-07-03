from __future__ import annotations

from typing import Iterable

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db.transaction import atomic

from apps.activity.models import ActivityEventModel
from core.validators.activity_validators import (
    activity_triplet_from_object,
    normalize_activity_triplet,
    validate_activity_payload,
    validate_activity_verb,
)

User = get_user_model()


class ActivityService:
    def __init__(self, notifier=None):
        self.notifier = notifier

    @atomic
    def publish(
        self,
        *,
        actor,
        verb: str,
        target_obj=None,
        target_app: str | None = "",
        target_model: str | None = "",
        target_id: int | str | None = None,
        payload: dict | None = None,
        is_private: bool = False,
        notify_users: Iterable[int] | None = None,
    ) -> ActivityEventModel:
        """
        РЎС‚РІРѕСЂСЋС” activity event.

        РњРѕР¶РЅР° РїРµСЂРµРґР°С‚Рё target_obj:
            publish(actor=user, verb=..., target_obj=topic)

        РђР±Рѕ РІСЂСѓС‡РЅСѓ triplet:
            publish(actor=user, verb=..., target_app="forum", target_model="forumtopicmodel", target_id=1)

        Р¤СЂРѕРЅС‚ РЅРµ РјР°С” РІРёРєР»РёРєР°С‚Рё С†Рµ РЅР°РїСЂСЏРјСѓ.
        """
        clean_verb = validate_activity_verb(verb)
        clean_payload = validate_activity_payload(payload)

        if target_obj is not None:
            clean_target_app, clean_target_model, clean_target_id = activity_triplet_from_object(target_obj)
        else:
            clean_target_app, clean_target_model, clean_target_id = normalize_activity_triplet(
                target_app=target_app,
                target_model=target_model,
                target_id=target_id,
            )

        event = ActivityEventModel.objects.create(
            actor=actor,
            verb=clean_verb,
            target_app=clean_target_app,
            target_model=clean_target_model,
            target_id=clean_target_id,
            payload=clean_payload,
            is_private=is_private,
        )

        self._notify(
            event=event,
            notify_users=notify_users,
        )

        return event

    def _notify(self, *, event: ActivityEventModel, notify_users: Iterable[int] | None) -> None:
        if not self.notifier or not notify_users:
            return

        user_ids = [user_id for user_id in notify_users if user_id and user_id != event.actor_id]

        if not user_ids:
            return

        try:
            self.notifier.notify_activity(event=event, user_ids=user_ids)
        except Exception:
            pass
