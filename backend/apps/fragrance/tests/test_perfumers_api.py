# apps/fragrance/tests/test_perfumers_api.py

from rest_framework.test import APITestCase
from rest_framework import status

from apps.fragrance.models import PerfumerModel as Perfumer


class PerfumerAPITest(APITestCase):
    def setUp(self):
        Perfumer.objects.create(name="Jacques Polge")
        Perfumer.objects.create(name="Edmond Roudnitska")

    def test_perfumer_list(self):
        url = "/userApi/fragrance/perfumers"

        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data["results"]), 2)

    def test_perfumer_has_fields(self):
        url = "/userApi/fragrance/perfumers"

        resp = self.client.get(url)

        perfumer = resp.data["results"][0]
        self.assertIn("id", perfumer)
        self.assertIn("name", perfumer)
