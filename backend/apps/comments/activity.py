from __future__ import annotations

import logging

from apps.activity.adapters import get_activity_service
from apps.activity.target_payloads import build_activity_target_context
from core.choises.activity_choises import ActivityVerb


logger = logging.getLogger(__name__)


def build_comment_activity_payload(*, target, comment, parent=None) -> dict:
    return {
        "activity_kind": "comment_created",
        "comment_id": comment.id,
        "parent_id": parent.id if parent else None,
        **build_activity_target_context(target),
    }


def publish_comment_activity(
    *,
    actor,
    target,
    comment,
    parent=None,
    notify_user_ids: list[int] | set[int] | tuple[int, ...] | None = None,
) -> None:
    try:
        get_activity_service().publish(
            actor=actor,
            verb=ActivityVerb.FORUM_COMMENT_CREATED.value,
            target_obj=target,
            payload=build_comment_activity_payload(
                target=target,
                comment=comment,
                parent=parent,
            ),
            is_private=False,
            notify_users=list(notify_user_ids or []),
        )
    except Exception:
        logger.exception(
            "Failed to publish comment activity comment_id=%s",
            comment.id,
        )
