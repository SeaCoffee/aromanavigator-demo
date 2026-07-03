# apps/fragrance/tests/test_fragrance_api.py

from rest_framework.test import APITestCase
from rest_framework import status

from apps.fragrance.models import (
    BrandModel as Brand,
    FragranceModel,
)


class FragranceListAPITest(APITestCase):

    def setUp(self):

        brand = Brand.objects.create(
            name="Chanel",
            slug="chanel",
        )

        self.fragrance = FragranceModel.objects.create(
            brand=brand,
            name="Chanel No 5",
            slug="chanel-no-5",
            release_year=1921,
        )

    def test_fragrance_list(self):

        url = "/userApi/fragrance/fragrances"

        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(len(resp.data["results"]) >= 1)

    def test_fragrance_detail(self):

        url = f"/userApi/fragrance/fragrances/{self.fragrance.id}"

        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        self.assertEqual(resp.data["name"], "Chanel No 5")
        self.assertEqual(resp.data["release_year"], 1921)
