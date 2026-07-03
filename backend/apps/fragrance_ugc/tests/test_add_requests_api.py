# apps/fragrance_ugc/tests/test_add_requests_api.py

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from apps.fragrance_ugc.models import FragranceAddRequestModel as FragranceAddRequest

User = get_user_model()


class FragranceAddRequestAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user3@test.com",
            password="123456",
        )
        self.client.force_authenticate(self.user)

    def test_create_add_request(self):
        url = "/userApi/fragrance_ugc/add-requests"
        payload = {
            "brand_name": "Guerlain",
            "fragrance_name": "Shalimar",
            "release_year": 1925,
            "perfumers_text": "Jacques Guerlain",
            "notes_text": "vanilla, iris, bergamot",
            "families_text": "oriental",
            "links_text": "https://example.com",
        }

        resp = self.client.post(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            FragranceAddRequest.objects.filter(
                created_by=self.user,
                fragrance_name="Shalimar",
            ).exists()
        )

    def test_list_my_add_requests(self):
        FragranceAddRequest.objects.create(
            created_by=self.user,
            brand_name="YSL",
            fragrance_name="Opium",
            release_year=1977,
            status="pending",
        )

        url = "/userApi/fragrance_ugc/add-requests/my"

        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data["results"]), 1)
