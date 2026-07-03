# apps/fragrance/tests/test_fragrance_service.py

from django.test import TestCase
from rest_framework import serializers

from apps.fragrance.models import BrandModel as Brand
from apps.fragrance.fragrance_service import FragranceService


class FragranceServiceTest(TestCase):

    def setUp(self):

        self.brand = Brand.objects.create(
            name="Dior",
            slug="dior",
        )

    def test_create_fragrance(self):

        fragrance = FragranceService.create_fragrance(
            brand_id=self.brand.id,
            name="Diorissimo",
            release_year=1956,
        )

        self.assertEqual(fragrance.name, "Diorissimo")
        self.assertEqual(fragrance.brand, self.brand)

    def test_duplicate_fragrance_name(self):

        FragranceService.create_fragrance(
            brand_id=self.brand.id,
            name="Poison",
        )

        with self.assertRaises(Exception):

            FragranceService.create_fragrance(
                brand_id=self.brand.id,
                name="Poison",
            )

    def test_explicit_slug_cannot_match_brand_slug(self):
        with self.assertRaises(serializers.ValidationError) as context:
            FragranceService.create_fragrance(
                brand_id=self.brand.id,
                name="Ambiguous",
                slug=self.brand.slug,
            )

        self.assertIn("slug", context.exception.detail)
