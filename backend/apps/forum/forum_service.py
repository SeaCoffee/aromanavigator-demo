from __future__ import annotations

import logging
from typing import Any

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from apps.forum.anti_spam import check_topic_antispam, mark_topic_antispam
from apps.mentions.mention_services import clear_mentions_for_object, sync_mentions_for_object
from apps.mentions.utils import extract_mentions
from apps.notifications.notifications_service import NotificationsService
from apps.tags.selectors import tag_codes_for_object
from apps.tags.services import extract_tags_from_text, sync_tags_for_object
from core.utils.forum_utils import make_unique_slug
from core.validators.forum_validators import (
    SECTION_SLUG_MAX_LENGTH,
    TOPIC_SLUG_MAX_LENGTH,
    validate_section_title,
    validate_topic_content,
    validate_topic_title,
)

from apps.forum.activity import publish_topic_created_activity
from apps.forum.models import ForumSectionModel, ForumTopicModel
from apps.forum.notifications import exclude_blocked_user_ids
from core.profanity_filter import censor_profanity


logger = logging.getLogger(__name__)

UNSET = object()


class ForumSectionWriteService:
    @transaction.atomic
    def create_section(
        self,
        *,
        title: str,
        description: str = "",
        is_active: bool = True,
        order: int = 0,
    ) -> ForumSectionModel:
        title = validate_section_title(title)

        return ForumSectionModel.objects.create(
            title=title,
            slug=make_unique_slug(
                model=ForumSectionModel,
                value=title,
                max_length=SECTION_SLUG_MAX_LENGTH,
                base_fallback="section",
            ),
            description=description or "",
            is_active=is_active,
            order=order or 0,
        )

    @transaction.atomic
    def update_section(
        self,
        *,
        section: ForumSectionModel,
        title: str | None = None,
        description: str | None = None,
        is_active: bool | None = None,
        order: int | None = None,
    ) -> ForumSectionModel:
        if title is not None:
            section.title = validate_section_title(title)

            if not section.slug:
                section.slug = make_unique_slug(
                    model=ForumSectionModel,
                    value=section.title,
                    max_length=SECTION_SLUG_MAX_LENGTH,
                    base_fallback="section",
                    exclude_id=section.id,
                )

        if description is not None:
            section.description = description or ""

        if is_active is not None:
            section.is_active = bool(is_active)

        if order is not None:
            section.order = order

        section.save(
            update_fields=[
                "title",
                "slug",
                "description",
                "is_active",
                "order",
                "updated_at",
            ],
        )

        return section

    @transaction.atomic
    def deactivate_section(self, *, section: ForumSectionModel) -> None:
        if not section.is_active:
            return

        section.is_active = False
        section.updated_at = timezone.now()
        section.save(update_fields=["is_active", "updated_at"])


class ForumWriteService:
    @transaction.atomic
    def create_topic(
        self,
        *,
        section: ForumSectionModel,
        author,
        title: str,
        content: str,
        is_pinned: bool = False,
        is_locked: bool = False,
        is_hidden: bool = False,
        extra_tags: Any = None,
    ) -> ForumTopicModel:
        title = validate_topic_title(title)
        content = validate_topic_content(content)

        title = censor_profanity(title).censored
        content = censor_profanity(content).censored

        check_topic_antispam(
            user=author,
            title=title,
            content=content,
        )

        topic = ForumTopicModel.objects.create(
            section=section,
            author=author,
            title=title,
            content=content,
            slug=make_unique_slug(
                model=ForumTopicModel,
                value=title,
                max_length=TOPIC_SLUG_MAX_LENGTH,
                base_fallback="topic",
                extra_filters={"section": section},
            ),
            last_activity_at=timezone.now(),
            is_pinned=bool(is_pinned),
            is_locked=bool(is_locked),
            is_hidden=bool(is_hidden),
        )

        mark_topic_antispam(
            user=author,
            title=title,
            content=content,
        )

        if not topic.is_hidden:
            ForumSectionModel.objects.filter(id=section.id).update(
                topics_count=F("topics_count") + 1,
            )

        self._sync_topic_tags(topic=topic, extra_tags=extra_tags)

        mentioned_ids = self._sync_topic_mentions(
            topic=topic,
            actor=author,
            notify=True,
        )

        transaction.on_commit(
            lambda: publish_topic_created_activity(
                topic=topic,
                exclude_notify_user_ids=mentioned_ids,
            )
        )

        return topic

    @transaction.atomic
    def update_topic(
        self,
        *,
        topic: ForumTopicModel,
        title: str | None = None,
        content: str | None = None,
        is_pinned: bool | None = None,
        is_locked: bool | None = None,
        is_hidden: bool | None = None,
        extra_tags: Any = UNSET,
    ) -> ForumTopicModel:
        was_hidden = topic.is_hidden

        if title is not None:
            topic.title = censor_profanity(validate_topic_title(title)).censored

            if not topic.slug:
                topic.slug = make_unique_slug(
                    model=ForumTopicModel,
                    value=topic.title,
                    max_length=TOPIC_SLUG_MAX_LENGTH,
                    base_fallback="topic",
                    exclude_id=topic.id,
                    extra_filters={"section": topic.section},
                )

        if content is not None:
            topic.content = censor_profanity(validate_topic_content(content)).censored

        if is_pinned is not None:
            topic.is_pinned = bool(is_pinned)

        if is_locked is not None:
            topic.is_locked = bool(is_locked)

        if is_hidden is not None:
            topic.is_hidden = bool(is_hidden)

        topic.last_activity_at = timezone.now()
        topic.save(
            update_fields=[
                "title",
                "slug",
                "content",
                "is_pinned",
                "is_locked",
                "is_hidden",
                "last_activity_at",
                "updated_at",
            ],
        )

        self._sync_topic_tags(topic=topic, extra_tags=extra_tags)

        self._sync_topic_mentions(
            topic=topic,
            actor=topic.author,
            notify=False,
        )

        if was_hidden != topic.is_hidden:
            self._sync_section_topic_counter_after_visibility_change(
                topic=topic,
                was_hidden=was_hidden,
            )

        return topic

    @transaction.atomic
    def soft_delete_topic(self, *, topic: ForumTopicModel) -> None:
        if topic.is_hidden:
            return

        topic.is_hidden = True
        topic.updated_at = timezone.now()
        topic.save(update_fields=["is_hidden", "updated_at"])

        ForumSectionModel.objects.filter(
            id=topic.section_id,
            topics_count__gt=0,
        ).update(
            topics_count=F("topics_count") - 1,
        )

        try:
            clear_mentions_for_object(obj=topic)
        except Exception:
            logger.exception(
                "Failed to clear mentions for hidden topic_id=%s",
                topic.id,
            )

    def _sync_topic_tags(self, *, topic: ForumTopicModel, extra_tags: Any = UNSET) -> None:
        text_tags = extract_tags_from_text(topic.title, topic.content)

        if extra_tags is UNSET:
            extra_tags = tag_codes_for_object(obj=topic)

        sync_tags_for_object(
            obj=topic,
            text_tags=text_tags,
            extra_tags=extra_tags,
        )

    def _sync_topic_mentions(
        self,
        *,
        topic: ForumTopicModel,
        actor,
        notify: bool = True,
    ) -> set[int]:
        try:
            usernames = extract_mentions(f"{topic.title} {topic.content}")

            mentioned_ids = sync_mentions_for_object(
                obj=topic,
                usernames=usernames,
                exclude_user_ids={actor.id},
            )

            if notify:
                self._notify_topic_mentions(
                    topic=topic,
                    actor=actor,
                    mentioned_ids=mentioned_ids,
                )

            return mentioned_ids

        except Exception:
            logger.exception(
                "Failed to sync forum topic mentions topic_id=%s",
                topic.id,
            )
            return set()

    def _notify_topic_mentions(
        self,
        *,
        topic: ForumTopicModel,
        actor,
        mentioned_ids: set[int],
    ) -> None:
        allowed_user_ids = exclude_blocked_user_ids(
            actor_id=actor.id,
            user_ids=mentioned_ids,
        )

        for user_id in allowed_user_ids:
            NotificationsService.notify(
                user_id=user_id,
                verb="mentioned_in_topic",
                actor_obj=actor,
                target_obj=topic,
                payload={
                    "notification_kind": "mentioned_in_topic",
                    "topic_id": topic.id,
                    "title": topic.title,
                },
                inc_unread=True,
            )

    def _sync_section_topic_counter_after_visibility_change(
        self,
        *,
        topic: ForumTopicModel,
        was_hidden: bool,
    ) -> None:
        if was_hidden and not topic.is_hidden:
            ForumSectionModel.objects.filter(id=topic.section_id).update(
                topics_count=F("topics_count") + 1,
            )

            return

        if not was_hidden and topic.is_hidden:
            ForumSectionModel.objects.filter(
                id=topic.section_id,
                topics_count__gt=0,
            ).update(
                topics_count=F("topics_count") - 1,
            )
