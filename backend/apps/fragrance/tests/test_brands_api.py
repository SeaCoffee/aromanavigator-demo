# apps/fragrance/tests/test_brands_api.py

from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from apps.fragrance.models import BrandModel as Brand


class BrandAPITest(APITestCase):

    def setUp(self):
        Brand.objects.create(name="Chanel", slug="chanel")
        Brand.objects.create(name="Dior", slug="dior")

    def test_brand_list(self):
        url = "/userApi/fragrance/brands"

        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(len(resp.data["results"]) >= 2)

    def test_brand_has_fields(self):
        url = "/userApi/fragrance/brands"

        resp = self.client.get(url)

        brand = resp.data["results"][0]

        self.assertIn("id", brand)
        self.assertIn("name", brand)
        self.assertIn("slug", brand)
