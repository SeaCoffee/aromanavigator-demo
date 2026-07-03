from apps.notifications.notifications_service import NotificationsService


class ActivityNotificationAdapter:
    def notify_activity(self, *, event, user_ids) -> None:
        NotificationsService.notify_many_from_activity(
            event=event,
            user_ids=user_ids,
        )


class NoopNotifications:
    def notify_activity(self, *, event, user_ids) -> None:
        return
