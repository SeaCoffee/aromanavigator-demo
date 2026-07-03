# apps/fragrance/tests/test_official_links.py

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework.test import APITestCase
from rest_framework import status

from apps.fragrance.models import (
    BrandModel as Brand,
    NoteModel as Note,
    OlfactoryFamilyModel as OlfactoryFamily,
    PerfumerModel as Perfumer,
    FragranceFamilyModel as FragranceFamily,
    FragranceModel,
    FragranceNoteOfficialModel as FragranceNoteOfficial,
    FragrancePerfumerModel as FragrancePerfumer,
)

User = get_user_model()


class FragranceOfficialLinksAPITest(APITestCase):
    def setUp(self):
        moderator_group, _ = Group.objects.get_or_create(name="moderator")

        self.user = User.objects.create_user(
            email="mod@example.com",
            password="testpass123",
        )
        self.user.groups.add(moderator_group)

        self.client.force_authenticate(self.user)

        self.brand = Brand.objects.create(name="Chanel", slug="chanel")
        self.fragrance = FragranceModel.objects.create(
            brand=self.brand,
            name="Coco Mademoiselle",
            slug="chanel-coco-mademoiselle",
            release_year=2001,
        )

        self.note = Note.objects.create(name="Orange", slug="orange")
        self.perfumer = Perfumer.objects.create(name="Jacques Polge")
        self.family = OlfactoryFamily.objects.create(name="Floral", slug="floral")

    def test_add_official_note(self):
        url = (
            f"/userApi/fragrance/fragrances/{self.fragrance.id}"
            "/official/notes"
        )
        payload = {
            "note_id": self.note.id,
            "position": 1,
            "level": "top",
        }

        resp = self.client.post(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            FragranceNoteOfficial.objects.filter(
                fragrance=self.fragrance,
                note=self.note,
            ).exists()
        )

    def test_add_official_perfumer(self):
        url = (
            f"/userApi/fragrance/fragrances/{self.fragrance.id}"
            "/official/perfumers"
        )
        payload = {
            "perfumer_id": self.perfumer.id,
        }

        resp = self.client.post(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            FragrancePerfumer.objects.filter(
                fragrance=self.fragrance,
                perfumer=self.perfumer,
            ).exists()
        )

    def test_add_official_family(self):
        url = (
            f"/userApi/fragrance/fragrances/{self.fragrance.id}"
            "/official/families"
        )
        payload = {
            "family_id": self.family.id,
        }

        resp = self.client.post(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            FragranceFamily.objects.filter(
                fragrance=self.fragrance,
                family=self.family,
            ).exists()
        )
