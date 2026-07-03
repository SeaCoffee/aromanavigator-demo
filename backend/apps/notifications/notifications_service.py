from __future__ import annotations

from collections.abc import Iterable

from django.contrib.auth import get_user_model
from django.db.models import F
from django.db.transaction import atomic
from django.utils import timezone

from apps.notifications.models import (
    NotificationAnnouncementReadModel,
    NotificationModel,
)
from apps.notifications.selectors import (
    active_announcements_base,
    unread_announcements_count_for_user,
)
from apps.users.models import UserStatsModel
from core.validators.notification_validators import (
    content_type_for_object,
    optional_content_type_for_object,
    resolve_content_type_triplet,
    validate_notification_payload,
    validate_notification_verb,
)
from core.choises.activity_choises import ActivityVerb

User = get_user_model()

ACTIVITY_NOTIFICATION_TEXT_BY_VERB = {
    ActivityVerb.USER_FOLLOWED.value: "РїС–РґРїРёСЃР°РІСЃСЏ(Р»Р°СЃСЏ) РЅР° РІР°СЃ",
}


def build_activity_notification_payload(*, event, recipient_id: int) -> dict:

    payload = dict(event.payload or {})

    payload.pop("notification_text", None)

    notification_text = ACTIVITY_NOTIFICATION_TEXT_BY_VERB.get(event.verb)

    if notification_text:
        payload["notification_text"] = notification_text

    return payload


def ensure_user_stats(user_id: int) -> None:
    UserStatsModel.objects.get_or_create(user_id=user_id)


def sync_unread_count(user_id: int) -> int:
    """
    РЎРёРЅС…СЂРѕРЅРёР·РёСЂСѓРµС‚ СЃС‡С‘С‚С‡РёРє СЃ С„Р°РєС‚РёС‡РµСЃРєРёРј РєРѕР»РёС‡РµСЃС‚РІРѕРј unread.

    Р’Р°Р¶РЅРѕ РґР»СЏ MySQL unsigned fields:
    РЅРµР»СЊР·СЏ Р±РµР·РѕРїР°СЃРЅРѕ РґРµР»Р°С‚СЊ F("count") - N, РµСЃР»Рё РјРѕР¶РµС‚ РїРѕР»СѓС‡РёС‚СЊСЃСЏ < 0.
    """
    ensure_user_stats(user_id)

    count = NotificationModel.objects.filter(
        user_id=user_id,
        is_read=False,
    ).count()

    UserStatsModel.objects.filter(user_id=user_id).update(
        notifications_unread_count=count,
    )

    return count


def combined_unread_count(user: User) -> int:
    stats = UserStatsModel.objects.filter(user=user).first()

    if stats is None:
        personal_count = sync_unread_count(user.id)
    else:
        personal_count = stats.notifications_unread_count

    return personal_count + unread_announcements_count_for_user(user)


def increment_unread_count(user_id: int, delta: int) -> None:
    ensure_user_stats(user_id)

    if delta >= 0:
        UserStatsModel.objects.filter(user_id=user_id).update(
            notifications_unread_count=F("notifications_unread_count") + delta,
        )
        return

    sync_unread_count(user_id)


class NotificationsService:
    @staticmethod
    def get_unread_count(user: User) -> int:
        return combined_unread_count(user)

    @staticmethod
    @atomic
    def notify(
        *,
        user_id: int,
        verb: str,
        actor_obj,
        target_obj=None,
        payload: dict | None = None,
        activity_event=None,
        inc_unread: bool = True,
    ) -> NotificationModel:
        clean_verb = validate_notification_verb(verb)
        clean_payload = validate_notification_payload(payload)

        actor_ct, actor_id = content_type_for_object(actor_obj)
        target_ct, target_id = optional_content_type_for_object(target_obj)

        notification = NotificationModel.objects.create(
            user_id=user_id,
            verb=clean_verb,
            actor_ct=actor_ct,
            actor_id=actor_id,
            target_ct=target_ct,
            target_id=target_id,
            activity_event=activity_event,
            payload=clean_payload,
        )

        if inc_unread:
            increment_unread_count(user_id, +1)

        return notification

    @staticmethod
    @atomic
    def notify_by_triplet(
        *,
        user_id: int,
        verb: str,
        actor_obj,
        target_app: str | None = None,
        target_model: str | None = None,
        target_id: int | str | None = None,
        payload: dict | None = None,
        activity_event=None,
        inc_unread: bool = True,
    ) -> NotificationModel:
        clean_verb = validate_notification_verb(verb)
        clean_payload = validate_notification_payload(payload)

        actor_ct, actor_id = content_type_for_object(actor_obj)
        target_ct, clean_target_id = resolve_content_type_triplet(
            app=target_app,
            model=target_model,
            object_id=target_id,
        )

        notification = NotificationModel.objects.create(
            user_id=user_id,
            verb=clean_verb,
            actor_ct=actor_ct,
            actor_id=actor_id,
            target_ct=target_ct,
            target_id=clean_target_id,
            activity_event=activity_event,
            payload=clean_payload,
        )

        if inc_unread:
            increment_unread_count(user_id, +1)

        return notification

    @staticmethod
    @atomic
    def notify_many(
        *,
        user_ids: Iterable[int],
        verb: str,
        actor_obj,
        target_obj=None,
        payload: dict | None = None,
        activity_event=None,
        inc_unread: bool = True,
    ) -> list[NotificationModel]:
        notifications = []

        clean_user_ids = {
            int(user_id)
            for user_id in user_ids
            if user_id
        }

        for user_id in clean_user_ids:
            notification = NotificationsService.notify(
                user_id=user_id,
                verb=verb,
                actor_obj=actor_obj,
                target_obj=target_obj,
                payload=payload,
                activity_event=activity_event,
                inc_unread=inc_unread,
            )
            notifications.append(notification)

        return notifications

    @staticmethod
    @atomic
    def notify_many_from_activity(*, event, user_ids: Iterable[int]) -> list[NotificationModel]:
        clean_user_ids = {
            int(user_id)
            for user_id in user_ids
            if user_id and int(user_id) != event.actor_id
        }

        notifications = []

        for user_id in clean_user_ids:
            notification = NotificationsService.notify_by_triplet(
                user_id=user_id,
                verb=event.verb,
                actor_obj=event.actor,
                target_app=event.target_app,
                target_model=event.target_model,
                target_id=event.target_id,
                payload=build_activity_notification_payload(
                    event=event,
                    recipient_id=user_id,
                ),
                activity_event=event,
                inc_unread=True,
            )
            notifications.append(notification)

        return notifications

    @staticmethod
    @atomic
    def mark_read(user: User, notification_id: int) -> int:
        now = timezone.now()

        updated = (
            NotificationModel.objects
            .filter(id=notification_id, user=user, is_read=False)
            .update(is_read=True, read_at=now)
        )

        if updated:
            increment_unread_count(user.id, -updated)

        return updated

    @staticmethod
    @atomic
    def mark_all_read(user: User) -> int:
        now = timezone.now()

        updated = (
            NotificationModel.objects
            .filter(user=user, is_read=False)
            .update(is_read=True, read_at=now)
        )

        if updated:
            increment_unread_count(user.id, -updated)

        return updated + NotificationsService.mark_all_announcements_read(user)

    @staticmethod
    @atomic
    def delete_notification(*, user: User, notification_id: int) -> bool:
        notification = (
            NotificationModel.objects
            .filter(id=notification_id, user=user)
            .only("id", "user_id", "is_read")
            .first()
        )

        if notification is None:
            return False

        was_unread = not notification.is_read
        notification.delete()

        if was_unread:
            increment_unread_count(user.id, -1)

        return True

    @staticmethod
    @atomic
    def delete_read(user: User) -> int:
        deleted_count, _ = NotificationModel.objects.filter(
            user=user,
            is_read=True,
        ).delete()

        return deleted_count

    @staticmethod
    @atomic
    def recompute_unread_count(user: User | int) -> int:
        if hasattr(user, "id"):
            user_obj = user
            user_id = user.id
        else:
            user_id = int(user)
            user_obj = User.objects.filter(id=user_id).first()

        personal_count = sync_unread_count(user_id)

        if user_obj is None:
            return personal_count

        return personal_count + unread_announcements_count_for_user(user_obj)

    @staticmethod
    @atomic
    def mark_announcement_read(user: User, announcement_id: int) -> int:
        announcement = (
            active_announcements_base()
            .filter(id=announcement_id)
            .only("id")
            .first()
        )

        if announcement is None:
            return 0

        _, created = NotificationAnnouncementReadModel.objects.get_or_create(
            announcement=announcement,
            user=user,
            defaults={"read_at": timezone.now()},
        )

        return 1 if created else 0

    @staticmethod
    @atomic
    def mark_all_announcements_read(user: User) -> int:
        now = timezone.now()
        unread_ids = list(
            active_announcements_base()
            .exclude(reads__user_id=user.id)
            .values_list("id", flat=True)
        )

        if not unread_ids:
            return 0

        NotificationAnnouncementReadModel.objects.bulk_create(
            [
                NotificationAnnouncementReadModel(
                    announcement_id=announcement_id,
                    user=user,
                    read_at=now,
                )
                for announcement_id in unread_ids
            ],
            ignore_conflicts=True,
        )

        return len(unread_ids)
