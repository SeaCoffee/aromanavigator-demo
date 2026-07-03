from __future__ import annotations

import logging

from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Case, F, IntegerField, Value, When
from django.utils import timezone

from apps.comments.antispam import check_comment_antispam, mark_comment_antispam
from apps.forum.models import ForumSectionModel, ForumTopicModel
from apps.mentions.mention_services import clear_mentions_for_object, sync_mentions_for_object
from apps.mentions.utils import extract_mentions
from apps.notifications.notifications_service import NotificationsService
from apps.social.models import SubscriptionModel
from apps.tags.services import clear_tags_for_object, extract_tags_from_text, sync_tags_for_object
from core.validators.comment_validators import (
    validate_comment_body,
    validate_parent_comment,
    validate_target_can_receive_comments,
)

from apps.comments.activity import publish_comment_activity
from apps.comments.models import CommentModel
from apps.comments.notifications import comment_activity_notify_user_ids, exclude_blocked_user_ids
from apps.photos.service import PhotoService
from core.profanity_filter import censor_profanity


logger = logging.getLogger(__name__)


class CommentService:
    @staticmethod
    @transaction.atomic
    def create_comment(
        *,
        user,
        target,
        body: str,
        parent: CommentModel | None = None,
        is_official: bool = False,
    ) -> CommentModel:
        validate_target_can_receive_comments(target)

        if parent is not None:
            parent = validate_parent_comment(target, parent.id)

        clean_body = censor_profanity(validate_comment_body(body)).censored

        check_comment_antispam(
            user=user,
            body=clean_body,
        )

        content_type = ContentType.objects.get_for_model(
            target,
            for_concrete_model=False,
        )

        comment = CommentModel.objects.create(
            user=user,
            content_type=content_type,
            object_id=target.pk,
            parent=parent,
            body=clean_body,
            is_official=bool(is_official and user.is_staff),
        )

        mark_comment_antispam(
            user=user,
            body=clean_body,
        )

        CommentService._sync_comment_tags(comment=comment)

        mentioned_user_ids = CommentService._sync_comment_mentions(
            comment=comment,
            actor=user,
        )

        CommentService._notify_mentions(
            comment=comment,
            actor=user,
            mentioned_user_ids=mentioned_user_ids,
        )

        if isinstance(target, ForumTopicModel):
            CommentService._after_forum_topic_comment_created(
                user=user,
                topic=target,
                comment=comment,
            )
        transaction.on_commit(
            lambda: CommentService._publish_comment_activity(
                user=user,
                target=target,
                comment=comment,
                parent=parent,
                already_notified_user_ids=mentioned_user_ids,
            )
        )

        return comment

    @staticmethod
    @transaction.atomic
    def update_comment(
        *,
        comment: CommentModel,
        body: str,
        actor,
    ) -> CommentModel:
        if comment.is_deleted:
            raise ValidationError("Р’РёРґР°Р»РµРЅРёР№ РєРѕРјРµРЅС‚Р°СЂ РЅРµ РјРѕР¶РЅР° СЂРµРґР°РіСѓРІР°С‚Рё.")

        clean_body = censor_profanity(validate_comment_body(body)).censored

        comment.body = clean_body
        comment.updated_at = timezone.now()
        comment.save(update_fields=["body", "updated_at"])

        CommentService._sync_comment_tags(comment=comment)

        CommentService._sync_comment_mentions(
            comment=comment,
            actor=actor,
        )

        return comment

    @staticmethod
    @transaction.atomic
    def soft_delete_comment(*, comment: CommentModel) -> None:
        if comment.is_deleted:
            return

        comment.is_deleted = True
        comment.body = ""
        comment.updated_at = timezone.now()
        comment.save(update_fields=["is_deleted", "body", "updated_at"])
        PhotoService.delete_attachments(comment)

        try:
            clear_tags_for_object(obj=comment)
        except Exception:
            logger.exception(
                "Failed to clear tags for deleted comment_id=%s",
                comment.id,
            )

        try:
            clear_mentions_for_object(obj=comment)
        except Exception:
            logger.exception(
                "Failed to clear mentions for deleted comment_id=%s",
                comment.id,
            )

        if (
            comment.content_type.app_label == "forum"
            and comment.content_type.model == "forumtopicmodel"
        ):
            CommentService._after_forum_topic_comment_deleted(comment=comment)


    @staticmethod
    def _sync_comment_tags(*, comment: CommentModel) -> None:
        tags = extract_tags_from_text(comment.body)

        sync_tags_for_object(
            obj=comment,
            text_tags=tags,
        )

    @staticmethod
    def _sync_comment_mentions(*, comment: CommentModel, actor) -> set[int]:
        usernames = extract_mentions(comment.body)

        try:
            return sync_mentions_for_object(
                obj=comment,
                usernames=usernames,
                exclude_user_ids={actor.id},
            )
        except Exception:
            logger.exception(
                "Failed to sync mentions for comment_id=%s",
                comment.id,
            )
            return set()

    @staticmethod
    def _notify_mentions(
        *,
        comment: CommentModel,
        actor,
        mentioned_user_ids: set[int],
    ) -> None:
        allowed_user_ids = exclude_blocked_user_ids(
            actor_id=actor.id,
            user_ids=mentioned_user_ids,
        )

        for user_id in allowed_user_ids:
            NotificationsService.notify(
                user_id=user_id,
                verb="mentioned_in_comment",
                actor_obj=actor,
                target_obj=comment,
                payload={
                    "notification_kind": "mentioned_in_comment",
                    "comment_id": comment.id,
                },
                inc_unread=True,
            )

    @staticmethod
    def _after_forum_topic_comment_created(
        *,
        user,
        topic: ForumTopicModel,
        comment: CommentModel,
    ) -> None:
        now = timezone.now()

        ForumTopicModel.objects.filter(id=topic.id).update(
            comments_count=F("comments_count") + 1,
            last_activity_at=now,
        )

        if topic.section_id:
            ForumSectionModel.objects.filter(id=topic.section_id).update(
                comments_count=F("comments_count") + 1,
            )

        topic_content_type = ContentType.objects.get_for_model(
            ForumTopicModel,
            for_concrete_model=False,
        )

        SubscriptionModel.objects.get_or_create(
            user=user,
            content_type=topic_content_type,
            object_id=topic.id,
        )

    @staticmethod
    def _after_forum_topic_comment_deleted(*, comment: CommentModel) -> None:
        now = timezone.now()

        ForumTopicModel.objects.filter(id=comment.object_id).update(
            comments_count=Case(
                When(comments_count__gt=0, then=F("comments_count") - 1),
                default=Value(0),
                output_field=IntegerField(),
            ),
            last_activity_at=now,
        )

        topic = (
            ForumTopicModel.objects
            .filter(id=comment.object_id)
            .only("section_id")
            .first()
        )

        if topic and topic.section_id:
            ForumSectionModel.objects.filter(id=topic.section_id).update(
                comments_count=Case(
                    When(comments_count__gt=0, then=F("comments_count") - 1),
                    default=Value(0),
                    output_field=IntegerField(),
                ),
            )

    @staticmethod
    def _publish_comment_activity(
        *,
        user,
        target,
        comment: CommentModel,
        parent: CommentModel | None,
        already_notified_user_ids: set[int],
    ) -> None:
        notify_user_ids = comment_activity_notify_user_ids(
            actor_id=user.id,
            target=target,
            parent=parent,
            already_notified_user_ids=already_notified_user_ids,
        )

        publish_comment_activity(
            actor=user,
            target=target,
            comment=comment,
            parent=parent,
            notify_user_ids=notify_user_ids,
        )
