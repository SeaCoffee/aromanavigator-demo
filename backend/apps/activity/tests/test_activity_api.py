# backend/apps/activity/tests/test_activity_api.py

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.activity.activity_service import ActivityService
from apps.fragrance.models import BrandModel, FragranceModel
from apps.social.models import BlockModel
from apps.users.models import ProfileModel

User = get_user_model()


class ActivityApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def make_user(self, email: str, display_name: str):
        user = User.objects.create(
            email=email,
            is_active=True,
            email_verified=True,
        )
        user.set_password("test-pass-123")
        user.save(update_fields=["password"])

        ProfileModel.objects.create(
            user=user,
            name="Test",
            display_name=display_name,
        )

        return user

    def make_fragrance(self):
        brand = BrandModel.objects.create(
            name="Activity Test Brand",
            slug="activity-test-brand",
        )

        return FragranceModel.objects.create(
            brand=brand,
            name="Activity Test Fragrance",
            slug="activity-test-brand-activity-test-fragrance",
            likes_count=0,
        )

    def unpack_list_response(self, response):
        """
        РџРѕРґРґРµСЂР¶РёРІР°РµС‚ СЂР°Р·РЅС‹Рµ С„РѕСЂРјР°С‚С‹ РѕС‚РІРµС‚Р°:
        1) РѕР±С‹С‡РЅС‹Р№ СЃРїРёСЃРѕРє DRF:
           [...]

        2) СЃС‚Р°РЅРґР°СЂС‚РЅР°СЏ РїР°РіРёРЅР°С†РёСЏ:
           {"count": ..., "results": [...]}

        3) РєР°СЃС‚РѕРјРЅР°СЏ РїР°РіРёРЅР°С†РёСЏ:
           {"total": ..., "results": [...]}

        4) РєР°СЃС‚РѕРјРЅС‹Р№ wrapper:
           {"data": [...]}
        """
        data = response.data

        if isinstance(data, list):
            return len(data), data

        if isinstance(data, dict):
            if "results" in data:
                results = data["results"]
                count = data.get("count", data.get("total", len(results)))
                return count, results

            if "data" in data and isinstance(data["data"], list):
                results = data["data"]
                count = data.get("count", data.get("total", len(results)))
                return count, results

        self.fail(f"Unexpected response format: {data}")

    def test_my_feed_contains_private_own_events(self):
        user = self.make_user("activity-user-1@example.com", "ActivityUser1")
        target = self.make_fragrance()

        ActivityService().publish(
            actor=user,
            verb="wardrobe.item_added",
            target_obj=target,
            payload={"favorite_id": 1},
            is_private=True,
        )

        self.client.force_authenticate(user=user)

        response = self.client.get("/userApi/activity/feed")

        self.assertEqual(response.status_code, 200)

        count, results = self.unpack_list_response(response)

        self.assertEqual(count, 1)
        self.assertEqual(results[0]["verb"], "wardrobe.item_added")
        self.assertTrue(results[0]["is_private"])

    def test_public_feed_excludes_private_events(self):
        user = self.make_user("activity-user-2@example.com", "ActivityUser2")
        target = self.make_fragrance()

        ActivityService().publish(
            actor=user,
            verb="wardrobe.item_added",
            target_obj=target,
            payload={"favorite_id": 1},
            is_private=True,
        )

        response = self.client.get("/userApi/activity/public")

        self.assertEqual(response.status_code, 200)

        count, results = self.unpack_list_response(response)

        self.assertEqual(count, 0)
        self.assertEqual(results, [])

    def test_user_feed_by_display_name_returns_public_events(self):
        user = self.make_user("activity-user-3@example.com", "PerfumeFan7778")
        target = self.make_fragrance()

        ActivityService().publish(
            actor=user,
            verb="forum.topic_created",
            target_obj=target,
            payload={"like_id": 1},
            is_private=False,
        )

        response = self.client.get(
            "/userApi/activity/user/by-display-name/PerfumeFan7778"
        )

        self.assertEqual(response.status_code, 200)

        count, results = self.unpack_list_response(response)

        self.assertEqual(count, 1)
        self.assertEqual(results[0]["verb"], "forum.topic_created")

    def test_target_feed_returns_public_events_for_target(self):
        user = self.make_user("activity-user-4@example.com", "ActivityUser4")
        target = self.make_fragrance()

        ActivityService().publish(
            actor=user,
            verb="forum.topic_created",
            target_obj=target,
            payload={"like_id": 1},
            is_private=False,
        )

        response = self.client.get(
            f"/userApi/activity/target/fragrance/fragrancemodel/{target.id}"
        )

        self.assertEqual(response.status_code, 200)

        count, results = self.unpack_list_response(response)

        self.assertEqual(count, 1)
        self.assertEqual(results[0]["target"]["app"], "fragrance")
        self.assertEqual(results[0]["target"]["model"], "fragrancemodel")
        self.assertEqual(results[0]["target"]["id"], target.id)

    def test_public_feed_excludes_inactive_actor_events(self):
        user = self.make_user("activity-inactive@example.com", "InactiveActivityUser")
        target = self.make_fragrance()
        ActivityService().publish(
            actor=user,
            verb="forum.topic_created",
            target_obj=target,
            is_private=False,
        )
        user.is_active = False
        user.save(update_fields=["is_active"])

        response = self.client.get("/userApi/activity/public")

        count, results = self.unpack_list_response(response)
        self.assertEqual(count, 0)
        self.assertEqual(results, [])

    def test_public_feed_excludes_blocked_actor_for_authenticated_viewer(self):
        viewer = self.make_user("activity-viewer@example.com", "ActivityViewer")
        actor = self.make_user("activity-blocked@example.com", "BlockedActivityActor")
        target = self.make_fragrance()
        ActivityService().publish(
            actor=actor,
            verb="forum.topic_created",
            target_obj=target,
            is_private=False,
        )
        BlockModel.objects.create(blocker=viewer, blocked=actor)
        self.client.force_authenticate(user=viewer)

        response = self.client.get("/userApi/activity/public")

        count, results = self.unpack_list_response(response)
        self.assertEqual(count, 0)
        self.assertEqual(results, [])

    def test_blocked_user_public_feed_is_empty_for_authenticated_viewer(self):
        viewer = self.make_user("activity-profile-viewer@example.com", "ProfileActivityViewer")
        actor = self.make_user("activity-profile-blocked@example.com", "ProfileBlockedActor")
        target = self.make_fragrance()
        ActivityService().publish(
            actor=actor,
            verb="forum.topic_created",
            target_obj=target,
            is_private=False,
        )
        BlockModel.objects.create(blocker=actor, blocked=viewer)
        self.client.force_authenticate(user=viewer)

        response = self.client.get(
            "/userApi/activity/user/by-display-name/ProfileBlockedActor"
        )

        count, results = self.unpack_list_response(response)
        self.assertEqual(count, 0)
        self.assertEqual(results, [])
