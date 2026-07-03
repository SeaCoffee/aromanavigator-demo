# apps/fragrance_ugc/tests/test_similarity_suggestions_api.py

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status

from apps.fragrance.models import BrandModel, FragranceModel
from apps.fragrance_ugc.models import (
    FragranceSimilaritySuggestionModel,
    FragranceSimilarityVoteModel,
)

User = get_user_model()


class SimilaritySuggestionAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user2@test.com",
            password="123456",
        )
        self.client.force_authenticate(self.user)

        self.brand = BrandModel.objects.create(name="Chanel", slug="chanel")

        self.fragrance1 = FragranceModel.objects.create(
            brand=self.brand,
            name="Allure",
            slug="chanel-allure",
            release_year=1996,
        )
        self.fragrance2 = FragranceModel.objects.create(
            brand=self.brand,
            name="Chance",
            slug="chanel-chance",
            release_year=2003,
        )

    def test_create_similarity_suggestion(self):
        url = f"/userApi/fragrance_ugc/fragrances/{self.fragrance1.id}/similarity-suggestions/create"
        payload = {
            "similar_fragrance_id": self.fragrance2.id,
        }

        resp = self.client.post(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            FragranceSimilaritySuggestionModel.objects.filter(
                fragrance=self.fragrance1,
                similar_fragrance=self.fragrance2,
                created_by=self.user,
            ).exists()
        )

    def test_list_similarity_suggestions(self):
        pending = FragranceSimilaritySuggestionModel.objects.create(
            fragrance=self.fragrance1,
            similar_fragrance=self.fragrance2,
            created_by=self.user,
            status="pending",
        )
        fragrance3 = FragranceModel.objects.create(
            brand=self.brand,
            name="Coco",
            slug="chanel-coco",
            release_year=1984,
        )
        approved = FragranceSimilaritySuggestionModel.objects.create(
            fragrance=self.fragrance1,
            similar_fragrance=fragrance3,
            created_by=self.user,
            status="approved",
        )

        url = f"/userApi/fragrance_ugc/fragrances/{self.fragrance1.id}/similarity-suggestions"

        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        ids = {item["id"] for item in resp.data["results"]}
        self.assertIn(approved.id, ids)
        self.assertNotIn(pending.id, ids)

    def test_vote_similarity_suggestion(self):
        suggestion = FragranceSimilaritySuggestionModel.objects.create(
            fragrance=self.fragrance1,
            similar_fragrance=self.fragrance2,
            created_by=self.user,
            status="pending",
        )

        voter = User.objects.create_user(
            email="voter2@test.com",
            password="123456",
        )
        self.client.force_authenticate(voter)

        url = f"/userApi/fragrance_ugc/similarity-suggestions/{suggestion.id}/vote"
        payload = {
            "value": 1,
        }

        resp = self.client.post(url, payload, format="json")

        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            FragranceSimilarityVoteModel.objects.filter(
                suggestion=suggestion,
                user=voter,
                value=1,
            ).exists()
        )
