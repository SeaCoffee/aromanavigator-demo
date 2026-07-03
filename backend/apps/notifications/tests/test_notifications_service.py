from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.test import TestCase
from django.utils import timezone

from apps.comments.models import CommentModel
from apps.forum.models import ForumSectionModel, ForumTopicModel
from apps.fragrance.models import BrandModel, FragranceModel
from apps.notifications.models import NotificationModel
from apps.notifications.notifications_service import NotificationsService
from apps.notifications.serializers import NotificationSerializer
from apps.users.models import UserStatsModel

User = get_user_model()


class NotificationsServiceTests(TestCase):
    def make_user(self, email: str):
        user = User.objects.create(
            email=email,
            is_active=True,
            email_verified=True,
        )
        user.set_password("test-pass-123")
        user.save(update_fields=["password"])
        return user

    def get_unread_count(self, user) -> int:
        stats = UserStatsModel.objects.get(user=user)
        return stats.notifications_unread_count

    def set_unread_count(self, user, value: int) -> None:
        UserStatsModel.objects.update_or_create(
            user=user,
            defaults={"notifications_unread_count": value},
        )

    def test_notify_creates_unread_notification_and_increments_counter(self):
        recipient = self.make_user("recipient1@example.com")
        actor = self.make_user("actor1@example.com")

        notification = NotificationsService.notify(
            user_id=recipient.id,
            verb="liked",
            actor_obj=actor,
            payload={"like_id": 1},
        )

        self.assertEqual(notification.user_id, recipient.id)
        self.assertEqual(notification.verb, "liked")
        self.assertFalse(notification.is_read)
        self.assertEqual(NotificationModel.objects.filter(user=recipient).count(), 1)
        self.assertEqual(self.get_unread_count(recipient), 1)

    def test_mark_read_marks_notification_and_syncs_counter(self):
        recipient = self.make_user("recipient2@example.com")
        actor = self.make_user("actor2@example.com")

        notification = NotificationsService.notify(
            user_id=recipient.id,
            verb="liked",
            actor_obj=actor,
        )

        updated = NotificationsService.mark_read(recipient, notification.id)

        notification.refresh_from_db()

        self.assertEqual(updated, 1)
        self.assertTrue(notification.is_read)
        self.assertIsNotNone(notification.read_at)
        self.assertEqual(self.get_unread_count(recipient), 0)

    def test_mark_read_returns_zero_for_already_read_notification(self):
        recipient = self.make_user("recipient3@example.com")
        actor = self.make_user("actor3@example.com")

        notification = NotificationsService.notify(
            user_id=recipient.id,
            verb="liked",
            actor_obj=actor,
        )

        first = NotificationsService.mark_read(recipient, notification.id)
        second = NotificationsService.mark_read(recipient, notification.id)

        self.assertEqual(first, 1)
        self.assertEqual(second, 0)
        self.assertEqual(self.get_unread_count(recipient), 0)

    def test_mark_all_read_does_not_underflow_when_stats_counter_is_too_low(self):
        recipient = self.make_user("recipient4@example.com")
        actor = self.make_user("actor4@example.com")

        for index in range(3):
            NotificationsService.notify(
                user_id=recipient.id,
                verb="liked",
                actor_obj=actor,
                payload={"like_id": index + 1},
            )

        # РЎРёРјСѓР»РёСЂСѓРµРј Р±РёС‚С‹Р№/СѓСЃС‚Р°СЂРµРІС€РёР№ СЃС‡С‘С‚С‡РёРє:
        # unread СѓРІРµРґРѕРјР»РµРЅРёР№ 3, Р° РІ user_stats СЃС‚РѕРёС‚ 0.
        # Р Р°РЅСЊС€Рµ РЅР° MySQL СЌС‚Рѕ РїР°РґР°Р»Рѕ РЅР° unsigned: 0 - 3.
        self.set_unread_count(recipient, 0)

        updated = NotificationsService.mark_all_read(recipient)

        self.assertEqual(updated, 3)
        self.assertEqual(
            NotificationModel.objects.filter(user=recipient, is_read=False).count(),
            0,
        )
        self.assertEqual(self.get_unread_count(recipient), 0)

    def test_delete_unread_notification_syncs_counter(self):
        recipient = self.make_user("recipient5@example.com")
        actor = self.make_user("actor5@example.com")

        notification = NotificationsService.notify(
            user_id=recipient.id,
            verb="liked",
            actor_obj=actor,
        )

        deleted = NotificationsService.delete_notification(
            user=recipient,
            notification_id=notification.id,
        )

        self.assertTrue(deleted)
        self.assertFalse(NotificationModel.objects.filter(id=notification.id).exists())
        self.assertEqual(self.get_unread_count(recipient), 0)

    def test_delete_read_notification_does_not_break_counter(self):
        recipient = self.make_user("recipient6@example.com")
        actor = self.make_user("actor6@example.com")

        notification = NotificationsService.notify(
            user_id=recipient.id,
            verb="liked",
            actor_obj=actor,
        )

        NotificationsService.mark_read(recipient, notification.id)

        deleted = NotificationsService.delete_notification(
            user=recipient,
            notification_id=notification.id,
        )

        self.assertTrue(deleted)
        self.assertEqual(self.get_unread_count(recipient), 0)

    def test_recompute_unread_count_repairs_wrong_counter(self):
        recipient = self.make_user("recipient7@example.com")
        actor = self.make_user("actor7@example.com")

        for index in range(2):
            NotificationsService.notify(
                user_id=recipient.id,
                verb="liked",
                actor_obj=actor,
                payload={"like_id": index + 1},
            )

        self.set_unread_count(recipient, 99)

        count = NotificationsService.recompute_unread_count(recipient)

        self.assertEqual(count, 2)
        self.assertEqual(self.get_unread_count(recipient), 2)

    def test_staff_actor_is_a_personal_actor_in_notification(self):
        recipient = self.make_user("recipient-staff-privacy@example.com")
        staff = self.make_user("staff-private@example.com")
        staff.is_staff = True
        staff.save(update_fields=["is_staff"])

        notification = NotificationsService.notify(
            user_id=recipient.id,
            verb="updated",
            actor_obj=staff,
        )

        payload = NotificationSerializer(notification).data

        self.assertEqual(payload["actor"]["id"], staff.id)

    def test_deleted_user_ref_is_serialized_as_unavailable(self):
        recipient = self.make_user("notification-deleted-user-recipient@example.com")
        actor = self.make_user("notification-deleted-user-actor@example.com")
        notification = NotificationsService.notify(
            user_id=recipient.id,
            verb="followed_user",
            actor_obj=actor,
        )
        actor.is_active = False
        actor.deleted_at = timezone.now()
        actor.save(update_fields=["is_active", "deleted_at"])

        payload = NotificationSerializer(notification).data

        self.assertFalse(payload["actor"]["is_available"])

    def test_comment_notification_includes_forum_target_context(self):
        recipient = self.make_user("notification-comment-forum-recipient@example.com")
        actor = self.make_user("notification-comment-forum-actor@example.com")
        section = ForumSectionModel.objects.create(
            title="Notification section",
            slug="notification-section",
        )
        topic = ForumTopicModel.objects.create(
            section=section,
            author=actor,
            title="Notification topic",
            slug="notification-topic",
            content="Topic body",
        )
        comment = CommentModel.objects.create(
            user=actor,
            content_type=ContentType.objects.get_for_model(
                topic,
                for_concrete_model=False,
            ),
            object_id=topic.id,
            body="@recipient",
        )
        notification = NotificationsService.notify(
            user_id=recipient.id,
            verb="mentioned_in_comment",
            actor_obj=actor,
            target_obj=comment,
            payload={"notification_kind": "mentioned_in_comment"},
        )

        data = NotificationSerializer(notification).data

        self.assertEqual(data["payload"]["comment_id"], comment.id)
        self.assertEqual(
            data["payload"]["comment_target"],
            {
                "app": "forum",
                "model": "forumtopicmodel",
                "id": topic.id,
                "slug": topic.slug,
            },
        )

    def test_comment_notification_includes_fragrance_target_context(self):
        recipient = self.make_user("notification-comment-fragrance-recipient@example.com")
        actor = self.make_user("notification-comment-fragrance-actor@example.com")
        brand = BrandModel.objects.create(
            name="Notification Brand",
            slug="notification-brand",
        )
        fragrance = FragranceModel.objects.create(
            brand=brand,
            name="Notification Fragrance",
            slug="notification-fragrance",
        )
        comment = CommentModel.objects.create(
            user=actor,
            content_type=ContentType.objects.get_for_model(
                fragrance,
                for_concrete_model=False,
            ),
            object_id=fragrance.id,
            body="@recipient",
        )
        notification = NotificationsService.notify(
            user_id=recipient.id,
            verb="mentioned_in_comment",
            actor_obj=actor,
            target_obj=comment,
            payload={"notification_kind": "mentioned_in_comment"},
        )

        data = NotificationSerializer(notification).data

        self.assertEqual(
            data["payload"]["comment_target"],
            {
                "app": "fragrance",
                "model": "fragrancemodel",
                "id": fragrance.id,
                "slug": fragrance.slug,
            },
        )
