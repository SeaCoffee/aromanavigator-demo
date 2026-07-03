# apps/fragrance/tests/test_notes_api.py

from rest_framework.test import APITestCase
from rest_framework import status

from apps.fragrance.models import NoteModel as Note


class NoteAPITest(APITestCase):
    def setUp(self):
        Note.objects.create(name="Rose", slug="rose")
        Note.objects.create(name="Jasmine", slug="jasmine")

    def test_note_list(self):
        url = "/userApi/fragrance/notes"

        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data["results"]), 2)

    def test_note_has_fields(self):
        url = "/userApi/fragrance/notes"

        resp = self.client.get(url)

        note = resp.data["results"][0]
        self.assertIn("id", note)
        self.assertIn("name", note)
        self.assertIn("slug", note)
