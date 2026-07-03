from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

from apps.users.models import ProfileModel
from apps.social.models import BlockModel

User = get_user_model()


class PublicUserByDisplayNameTests(APITestCase):
    def setUp(self):
        self.u1 = User.objects.create_user(
            email="u1@test.com",
            password="Pass12345!",
            is_active=True,
        )
        ProfileModel.objects.create(
            user=self.u1,
            display_name="PerfumeFan455",
            name="PF",
        )

        self.u2 = User.objects.create_user(
            email="u2@test.com",
            password="Pass12345!",
            is_active=False,  # вќ—РЅРµ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РґРѕСЃС‚СѓРїРµРЅ
        )
        ProfileModel.objects.create(
            user=self.u2,
            display_name="HiddenUser",
            name="Hidden",
        )

    def test_get_by_username_ok(self):
        url = reverse("users-by-display-name", kwargs={"username": "PerfumeFan455"})
        r = self.client.get(url)

        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["id"], self.u1.id)
        self.assertEqual(r.data["profile"]["display_name"], "PerfumeFan455")

    def test_get_by_username_strips_at(self):
        url = reverse("users-by-display-name", kwargs={"username": "@PerfumeFan455"})
        r = self.client.get(url)

        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(r.data["id"], self.u1.id)

    def test_get_by_username_404_if_not_found(self):
        url = reverse("users-by-display-name", kwargs={"username": "NoSuchUser"})
        r = self.client.get(url)

        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_by_username_404_if_inactive(self):
        url = reverse("users-by-display-name", kwargs={"username": "HiddenUser"})
        r = self.client.get(url)

        self.assertEqual(r.status_code, status.HTTP_404_NOT_FOUND)

    def test_profile_is_hidden_from_user_blocked_by_owner(self):
        viewer = User.objects.create_user(
            email="viewer@test.com",
            password="Pass12345!",
            is_active=True,
        )
        ProfileModel.objects.create(user=viewer, display_name="Viewer", name="Viewer")
        BlockModel.objects.create(blocker=self.u1, blocked=viewer)
        self.client.force_authenticate(viewer)

        response = self.client.get(
            reverse("users-by-display-name", kwargs={"username": "PerfumeFan455"})
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_blocker_can_open_profile_to_unblock(self):
        viewer = User.objects.create_user(
            email="blocker@test.com",
            password="Pass12345!",
            is_active=True,
        )
        ProfileModel.objects.create(user=viewer, display_name="Blocker", name="Blocker")
        BlockModel.objects.create(blocker=viewer, blocked=self.u1)
        self.client.force_authenticate(viewer)

        response = self.client.get(
            reverse("users-by-display-name", kwargs={"username": "PerfumeFan455"})
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
