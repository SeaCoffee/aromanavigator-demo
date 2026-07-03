# apps/fragrance/tests/test_fragrance_filters.py

from rest_framework.test import APITestCase
from rest_framework import status

from apps.fragrance.models import BrandModel as Brand, FragranceModel


class FragranceFiltersAPITest(APITestCase):

    def setUp(self):

        self.brand1 = Brand.objects.create(name="Chanel", slug="chanel")
        self.brand2 = Brand.objects.create(name="Dior", slug="dior")

        FragranceModel.objects.create(
            brand=self.brand1,
            name="Chanel No 5",
            slug="chanel-no-5",
            release_year=1921,
        )

        FragranceModel.objects.create(
            brand=self.brand2,
            name="Diorissimo",
            slug="dior-diorissimo",
            release_year=1956,
        )

    def test_filter_by_brand(self):

        url = f"/userApi/fragrance/fragrances?brand={self.brand1.id}"

        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        for item in resp.data["results"]:
            self.assertEqual(item["brand"]["id"], self.brand1.id)

    def test_search_query(self):

        url = "/userApi/fragrance/fragrances?q=Dior"

        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(
            any("Dior" in f["name"] for f in resp.data["results"])
        )

    def test_ordering(self):

        url = "/userApi/fragrance/fragrances?ordering=name"

        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        names = [f["name"] for f in resp.data["results"]]

        self.assertEqual(names, sorted(names))
