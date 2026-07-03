from __future__ import annotations

import logging

from django.db import IntegrityError, transaction

from core.utils.likes_counter import increment_likes_counter
from core.validators.likes_validators import validate_like_target_for_user

from .activity import get_external_owner_id, publish_like_activity
from .models import LikeModel
from .selectors import get_target_content_type


logger = logging.getLogger(__name__)


def publish_like_created_events(*, user, target, like_id: int) -> None:
    publish_like_activity(
        actor=user,
        target=target,
        like_id=like_id,
    )


def publish_like_deleted_events(*, user, target) -> None:
    return None


class LikeService:
    @staticmethod
    def create_like(*, user, target) -> tuple[LikeModel, bool]:
        validate_like_target_for_user(user=user, target=target)

        content_type = get_target_content_type(target)

        try:
            with transaction.atomic():
                like = LikeModel.objects.create(
                    user=user,
                    content_type=content_type,
                    object_id=target.pk,
                )

                increment_likes_counter(target, +1)

                transaction.on_commit(
                    lambda: publish_like_created_events(
                        user=user,
                        target=target,
                        like_id=like.id,
                    )
                )

                return like, True

        except IntegrityError:
            like = LikeModel.objects.get(
                user=user,
                content_type=content_type,
                object_id=target.pk,
            )

            return like, False

    @staticmethod
    def delete_like(*, like: LikeModel, actor) -> None:
        target = like.content_object

        with transaction.atomic():
            deleted_count, _ = LikeModel.objects.filter(pk=like.pk).delete()

            if deleted_count <= 0:
                return

            if target is None:
                return

            increment_likes_counter(target, -1)

            transaction.on_commit(
                lambda: publish_like_deleted_events(
                    user=actor,
                    target=target,
                )
            )

    @staticmethod
    def delete_like_by_target(*, user, target) -> bool:
        content_type = get_target_content_type(target)

        like = (
            LikeModel.objects
            .filter(
                user=user,
                content_type=content_type,
                object_id=target.pk,
            )
            .first()
        )

        if like is None:
            return False

        LikeService.delete_like(
            like=like,
            actor=user,
        )

        return True

    @staticmethod
    def toggle_like(*, user, target) -> tuple[bool, LikeModel | None]:
        content_type = get_target_content_type(target)

        like = (
            LikeModel.objects
            .filter(
                user=user,
                content_type=content_type,
                object_id=target.pk,
            )
            .first()
        )

        if like is not None:
            LikeService.delete_like(
                like=like,
                actor=user,
            )
            return False, None

        validate_like_target_for_user(user=user, target=target)

        created_like, _created = LikeService.create_like(
            user=user,
            target=target,
        )

        return True, created_like
