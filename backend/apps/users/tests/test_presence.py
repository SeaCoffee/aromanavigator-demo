# apps/users/tests/test_presence.py
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from unittest.mock import patch

from django.contrib.auth import get_user_model

from apps.social.models import BlockModel

User = get_user_model()


class FakeRedis:
    def __init__(self):
        self.store = set()

    def setex(self, key, ttl, value):
        self.store.add(key)
        return True

    def exists(self, key):
        return 1 if key in self.store else 0

    def pipeline(self):
        return FakePipe(self)


class FakePipe:
    def __init__(self, redis):
        self.redis = redis
        self.keys = []

    def exists(self, key):
        self.keys.append(key)
        return self

    def execute(self):
        return [self.redis.exists(k) for k in self.keys]


class PresenceTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="u1@test.com",
            password="Pass12345!",
            is_active=True,
        )

    @patch("apps.users.presence.r", new_callable=lambda: FakeRedis())
    def test_heartbeat_sets_presence_key(self, fake_r):
        self.client.force_authenticate(self.user)

        url = reverse("presence-heartbeat")  # name РёР· urls.py
        r = self.client.post(url)

        self.assertEqual(r.status_code, status.HTTP_204_NO_CONTENT)
        self.assertTrue(fake_r.exists(f"presence:{self.user.id}"))

    @patch("apps.users.presence.r", new_callable=lambda: FakeRedis())
    def test_presence_bulk_requires_auth(self, fake_r):
        url = reverse("presence-bulk")
        r = self.client.get(url, {"ids": [self.user.id]})
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("apps.users.presence.r", new_callable=lambda: FakeRedis())
    def test_presence_bulk_returns_flags(self, fake_r):
        self.client.force_authenticate(self.user)
        fake_r.setex(f"presence:{self.user.id}", 60, 123)

        url = reverse("presence-bulk")
        r = self.client.get(url, {"ids": [self.user.id, 999]})

        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(
            r.json(),
            {
                str(self.user.id): {"is_online": True},
                "999": {"is_online": False},
            },
        )

    @patch("apps.users.presence.r")
    def test_presence_bulk_redis_error_returns_all_false(self, r_mock):
        from apps.users.redis_client import RedisConnectionError

        self.client.force_authenticate(self.user)
        r_mock.pipeline.side_effect = RedisConnectionError("boom")

        url = reverse("presence-bulk")
        r = self.client.get(url, {"ids": [self.user.id, 2]})

        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(
            r.json(),
            {
                str(self.user.id): {"is_online": False},
                "2": {"is_online": False},
            },
        )

    @patch("apps.users.presence.r", new_callable=lambda: FakeRedis())
    def test_presence_bulk_hides_blocked_user_status(self, fake_r):
        target = User.objects.create_user(
            email="blocked@test.com",
            password="Pass12345!",
            is_active=True,
        )
        BlockModel.objects.create(blocker=target, blocked=self.user)
        fake_r.setex(f"presence:{target.id}", 60, 123)
        self.client.force_authenticate(self.user)

        response = self.client.get(
            reverse("presence-bulk"),
            {"ids": [target.id]},
        )

        self.assertEqual(
            response.json(),
            {str(target.id): {"is_online": False}},
        )

    @patch("apps.users.presence.r", new_callable=lambda: FakeRedis())
    def test_presence_bulk_deduplicates_and_limits_ids(self, fake_r):
        self.client.force_authenticate(self.user)
        requested_ids = [self.user.id, self.user.id, *range(1000, 1120)]

        response = self.client.get(
            reverse("presence-bulk"),
            {"ids": requested_ids},
        )

        self.assertEqual(len(response.json()), 100)
        self.assertEqual(list(response.json())[0], str(self.user.id))
