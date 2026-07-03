# apps/fragrance/tests/test_fragrance_crud_api.py

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

from rest_framework.test import APITestCase
from rest_framework import status

from apps.fragrance.models import BrandModel as Brand, FragranceModel

User = get_user_model()


class FragranceCRUDAPITest(APITestCase):

    def setUp(self):

        moderator_group, _ = Group.objects.get_or_create(name="moderator")

        self.user = User.objects.create_user(
            email="mod@test.com",
            password="123456",
        )

        self.user.groups.add(moderator_group)

        self.client.force_authenticate(self.user)

        self.brand = Brand.objects.create(
            name="TestBrand",
            slug="testbrand",
        )

    def test_create_fragrance(self):

        url = "/userApi/fragrance/fragrances/create"

        payload = {
            "brand_id": self.brand.id,
            "name": "Test Fragrance",
            "release_year": 2024,
            "image_url": "",
        }

        resp = self.client.post(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

        self.assertTrue(
            FragranceModel.objects.filter(name="Test Fragrance").exists()
        )

    def test_create_fragrance_rejects_invalid_release_year(self):
        response = self.client.post(
            "/userApi/fragrance/fragrances/create",
            {
                "brand_id": self.brand.id,
                "name": "Invalid Year",
                "release_year": "abc",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(
            FragranceModel.objects.filter(name="Invalid Year").exists()
        )

    def test_duplicate_brand_error_is_user_facing(self):
        response = self.client.post(
            "/userApi/fragrance/brands/create",
            {"name": "testbrand"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data["name"][0],
            "Р‘СЂРµРЅРґ С–Р· С‚Р°РєРѕСЋ РЅР°Р·РІРѕСЋ РІР¶Рµ С–СЃРЅСѓС”.",
        )

    def test_update_fragrance(self):

        fragrance = FragranceModel.objects.create(
            brand=self.brand,
            name="Old Name",
        )

        url = f"/userApi/fragrance/fragrances/{fragrance.id}/update"

        payload = {
            "brand_id": self.brand.id,
            "name": "New Name",
            "release_year": 2025,
            "image_url": "",
        }

        resp = self.client.patch(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        fragrance.refresh_from_db()

        self.assertEqual(fragrance.name, "New Name")

    def test_delete_fragrance(self):

        fragrance = FragranceModel.objects.create(
            brand=self.brand,
            name="Delete Me",
        )

        url = f"/userApi/fragrance/fragrances/{fragrance.id}/delete"

        resp = self.client.delete(url)

        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)

        self.assertFalse(
            FragranceModel.objects.filter(id=fragrance.id).exists()
        )
