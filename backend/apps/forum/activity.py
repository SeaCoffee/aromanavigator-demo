from __future__ import annotations

import logging

from apps.activity.adapters import get_activity_service
from apps.forum.models import ForumTopicModel
from apps.forum.notifications import section_subscriber_user_ids
from core.choises.activity_choises import ActivityVerb


logger = logging.getLogger(__name__)


def build_topic_activity_payload(topic: ForumTopicModel) -> dict:
    return {
        "activity_kind": "forum_topic_created",
        "topic": {
            "id": topic.id,
            "title": topic.title,
            "slug": topic.slug,
            "section_id": topic.section_id,
            "section_title": getattr(topic.section, "title", ""),
            "section_slug": getattr(topic.section, "slug", ""),
        },
    }


def publish_topic_created_activity(
    *,
    topic: ForumTopicModel,
    exclude_notify_user_ids: set[int] | None = None,
) -> None:
    if topic.is_hidden:
        return

    notify_users = section_subscriber_user_ids(
        section=topic.section,
        actor_id=topic.author_id,
        exclude_ids=exclude_notify_user_ids,
    )

    try:
        get_activity_service().publish(
            actor=topic.author,
            verb=ActivityVerb.FORUM_TOPIC_CREATED.value,
            target_obj=topic,
            payload=build_topic_activity_payload(topic),
            is_private=False,
            notify_users=notify_users,
        )
    except Exception:
        logger.exception(
            "Failed to publish forum topic created activity topic_id=%s",
            topic.id,
        )
