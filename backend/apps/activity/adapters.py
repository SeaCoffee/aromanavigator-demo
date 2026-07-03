from apps.activity.activity_service import ActivityService
from apps.notifications.adapters import ActivityNotificationAdapter


def get_activity_service() -> ActivityService:
    return ActivityService(notifier=ActivityNotificationAdapter())
