from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

from apps.users.models import ProfileModel
from apps.social.models import BlockModel

User = get_user_model()


class PublicUserSearchTests(APITestCase):
    def setUp(self):
        self.u1 = User.objects.create_user(
            email="a@test.com",
            password="Pass12345!",
            is_active=True,
        )
        ProfileModel.objects.create(
            user=self.u1,
            display_name="Alice",
            name="Alice Smith",
        )

        self.u2 = User.objects.create_user(
            email="b@test.com",
            password="Pass12345!",
            is_active=True,
        )
        ProfileModel.objects.create(
            user=self.u2,
            display_name="Bob",
            name="Bobby",
        )

        self.u3 = User.objects.create_user(
            email="c@test.com",
            password="Pass12345!",
            is_active=False,  # вќ— РЅРµ РґРѕР»Р¶РµРЅ РІРµСЂРЅСѓС‚СЊСЃСЏ
        )
        ProfileModel.objects.create(
            user=self.u3,
            display_name="Charlie",
            name="Charlie",
        )

    def test_search_without_query_returns_active_users(self):
        url = reverse("users_search")
        r = self.client.get(url)

        self.assertEqual(r.status_code, status.HTTP_200_OK)
        ids = [u["id"] for u in r.data["results"]]
        self.assertIn(self.u1.id, ids)
        self.assertIn(self.u2.id, ids)
        self.assertNotIn(self.u3.id, ids)

    def test_search_by_display_name(self):
        url = reverse("users_search")
        r = self.client.get(url, {"q": "Ali"})

        self.assertEqual(len(r.data["results"]), 1)
        self.assertEqual(r.data["results"][0]["id"], self.u1.id)

    def test_search_by_name(self):
        url = reverse("users_search")
        r = self.client.get(url, {"q": "Bobby"})

        self.assertEqual(len(r.data["results"]), 1)
        self.assertEqual(r.data["results"][0]["id"], self.u2.id)

    def test_search_strips_at_symbol(self):
        url = reverse("users_search")
        r = self.client.get(url, {"q": "@Alice"})

        self.assertEqual(len(r.data["results"]), 1)
        self.assertEqual(r.data["results"][0]["id"], self.u1.id)

    def test_results_sorted_by_display_name(self):
        url = reverse("users_search")
        r = self.client.get(url)

        names = [u["profile"]["display_name"] for u in r.data["results"]]
        self.assertEqual(names, sorted(names))

    def test_authenticated_search_hides_blocks_in_both_directions(self):
        viewer = User.objects.create_user(
            email="viewer@test.com",
            password="Pass12345!",
            is_active=True,
        )
        ProfileModel.objects.create(
            user=viewer,
            display_name="Viewer",
            name="Viewer",
        )
        BlockModel.objects.create(blocker=viewer, blocked=self.u1)
        BlockModel.objects.create(blocker=self.u2, blocked=viewer)
        self.client.force_authenticate(viewer)

        response = self.client.get(reverse("users_search"))
        ids = {item["id"] for item in response.data["results"]}

        self.assertNotIn(self.u1.id, ids)
        self.assertNotIn(self.u2.id, ids)
