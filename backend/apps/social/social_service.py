from __future__ import annotations

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import transaction

from apps.activity.adapters import get_activity_service
from apps.social.models import BlockModel, FollowModel, SubscriptionModel
from apps.users.models import UserStatsModel
from core.choises.activity_choises import ActivityVerb
from core.validators.social_validators import (
    validate_block_payload,
    validate_follow_payload,
    validate_subscription_payload,
)


User = get_user_model()


class SocialError(Exception):
    pass


def _validation_error_text(exc: ValidationError) -> str:
    if hasattr(exc, "messages") and exc.messages:
        return exc.messages[0]

    return str(exc)


class SocialService:
    @staticmethod
    def _raise_social_error(exc: ValidationError) -> None:
        raise SocialError(_validation_error_text(exc))

    @staticmethod
    def ensure_stats(user) -> None:
        UserStatsModel.objects.get_or_create(user=user)

    @staticmethod
    def recount_counts(user_id: int) -> None:
        UserStatsModel.objects.get_or_create(user_id=user_id)

        followers = FollowModel.objects.filter(followee_id=user_id).count()
        following = FollowModel.objects.filter(follower_id=user_id).count()

        UserStatsModel.objects.filter(user_id=user_id).update(
            followers_count=followers,
            following_count=following,
        )

    @staticmethod
    def get_counts(user_id: int) -> dict:
        stats, _ = UserStatsModel.objects.get_or_create(user_id=user_id)

        return {
            "followers_count": stats.followers_count,
            "following_count": stats.following_count,
        }

    @staticmethod
    @transaction.atomic
    def follow_toggle(actor: User, target: User):
        try:
            validate_follow_payload(actor=actor, target=target)
        except ValidationError as exc:
            SocialService._raise_social_error(exc)

        SocialService.ensure_stats(actor)
        SocialService.ensure_stats(target)

        follow, created = FollowModel.objects.get_or_create(
            follower=actor,
            followee=target,
        )

        if created:
            SocialService.recount_counts(actor.id)
            SocialService.recount_counts(target.id)

            target_profile = getattr(target, "profile", None)

            transaction.on_commit(
            lambda: get_activity_service().publish(
                actor=actor,
                verb=ActivityVerb.USER_FOLLOWED.value,
                target_obj=target,
                payload={
                    "target_user_id": target.id,
                    "target_display_name": (
                        getattr(target_profile, "display_name", "")
                        or getattr(target_profile, "name", "")
                        or f"User #{target.id}"
                    ),
                },
                is_private=False,
                notify_users=[target.id],
            )
        )

            return follow, True, {
                "status": "followed",
                "me": SocialService.get_counts(actor.id),
                "target": SocialService.get_counts(target.id),
            }

        follow.delete()

        SocialService.recount_counts(actor.id)
        SocialService.recount_counts(target.id)

        return None, False, {
            "status": "unfollowed",
            "me": SocialService.get_counts(actor.id),
            "target": SocialService.get_counts(target.id),
        }

    @staticmethod
    @transaction.atomic
    def block_toggle(actor: User, target: User):
        try:
            validate_block_payload(actor=actor, target=target)
        except ValidationError as exc:
            SocialService._raise_social_error(exc)

        SocialService.ensure_stats(actor)
        SocialService.ensure_stats(target)

        block, created = BlockModel.objects.get_or_create(
            blocker=actor,
            blocked=target,
        )

        if created:
            FollowModel.objects.by_pair(follower=actor, followee=target).delete()
            FollowModel.objects.by_pair(follower=target, followee=actor).delete()

            SocialService.recount_counts(actor.id)
            SocialService.recount_counts(target.id)

            return block, True, {
                "status": "blocked",
                "me": SocialService.get_counts(actor.id),
                "target": SocialService.get_counts(target.id),
            }

        block.delete()

        return None, False, {
            "status": "unblocked",
            "me": SocialService.get_counts(actor.id),
            "target": SocialService.get_counts(target.id),
        }


class SubscriptionService:
    @staticmethod
    def _raise_social_error(exc: ValidationError) -> None:
        raise SocialError(_validation_error_text(exc))

    @staticmethod
    @transaction.atomic
    def subscribe(*, user: User, target):
        try:
            ct = validate_subscription_payload(user=user, target=target)
        except ValidationError as exc:
            SubscriptionService._raise_social_error(exc)

        subscription, created = SubscriptionModel.objects.get_or_create(
            user=user,
            content_type=ct,
            object_id=target.pk,
        )

        return subscription, created

    @staticmethod
    @transaction.atomic
    def unsubscribe(*, user: User, target) -> int:
        try:
            ct = validate_subscription_payload(user=user, target=target)
        except ValidationError as exc:
            SubscriptionService._raise_social_error(exc)

        deleted_count, _ = SubscriptionModel.objects.filter(
            user=user,
            content_type=ct,
            object_id=target.pk,
        ).delete()

        return deleted_count
