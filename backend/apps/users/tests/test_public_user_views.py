# apps/users/tests/test_public_user_views.py
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import ProfileModel

User = get_user_model()


class PublicUserViewsTests(APITestCase):
    def _create_user_with_profile(
        self,
        email: str,
        display_name: str,
        name: str = "Name",
        is_active: bool = True,
    ) -> User:
        user = User(email=email, is_active=is_active)
        user.set_password("Testpass123!")
        user.save()
        ProfileModel.objects.create(user=user, name=name, display_name=display_name)
        return user

    # ---------- PublicUserSearchView ----------

    def _extract_results(self, data):
        """
        РќР° СЃР»СѓС‡Р°Р№, РµСЃР»Рё PagePagination РІРѕР·РІСЂР°С‰Р°РµС‚ {"results": [...]} РёР»Рё РїСЂРѕСЃС‚Рѕ СЃРїРёСЃРѕРє.
        """
        if isinstance(data, dict) and "results" in data:
            return data["results"]
        return data

    def test_public_user_search_returns_only_active(self):
        """
        PublicUserSearchView:
        - РІРѕР·РІСЂР°С‰Р°РµС‚ С‚РѕР»СЊРєРѕ Р°РєС‚РёРІРЅС‹С… РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№
        - РЅРµР°РєС‚РёРІРЅС‹Рµ (is_active=False) С„РёР»СЊС‚СЂСѓСЋС‚СЃСЏ
        """
        active1 = self._create_user_with_profile("a1@example.com", "Alice", is_active=True)
        active2 = self._create_user_with_profile("a2@example.com", "Bob", is_active=True)
        inactive = self._create_user_with_profile("a3@example.com", "Charlie", is_active=False)

        url = reverse("users_search")
        resp = self.client.get(url)  # q РЅРµ РїРµСЂРµРґР°С‘Рј в†’ РІСЃРµ Р°РєС‚РёРІРЅС‹Рµ

        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)

        results = self._extract_results(resp.data)
        ids = {item["id"] for item in results}

        self.assertIn(active1.id, ids)
        self.assertIn(active2.id, ids)
        self.assertNotIn(inactive.id, ids)

    def test_public_user_search_filters_by_q_in_display_name_and_name(self):
        """
        Р¤РёР»СЊС‚СЂР°С†РёСЏ РїРѕ q:
        - РёС‰РµС‚ РїРѕ profile__display_name__icontains
        - Рё РїРѕ profile__name__icontains
        """
        u1 = self._create_user_with_profile(
            "u1@example.com",
            display_name="Ann",
            name="Annabel",
            is_active=True,
        )
        u2 = self._create_user_with_profile(
            "u2@example.com",
            display_name="Bob",
            name="Bobson",
            is_active=True,
        )

        url = reverse("users_search")
        resp = self.client.get(url, {"q": "Ann"})

        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)

        results = self._extract_results(resp.data)
        ids = {item["id"] for item in results}

        self.assertEqual(ids, {u1.id})  # С‚РѕР»СЊРєРѕ Ann

    def test_public_user_search_ordering_by_display_name(self):
        """
        Р РµР·СѓР»СЊС‚Р°С‚ РѕС‚СЃРѕСЂС‚РёСЂРѕРІР°РЅ РїРѕ profile__display_name.
        """
        u1 = self._create_user_with_profile("c@example.com", "Charlie", is_active=True)
        u2 = self._create_user_with_profile("a@example.com", "Alice", is_active=True)
        u3 = self._create_user_with_profile("b@example.com", "Bob", is_active=True)

        url = reverse("users_search")
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)

        results = self._extract_results(resp.data)
        display_names = [item["profile"]["display_name"] for item in results]

        # РўРѕР»СЊРєРѕ РЅР°С€Рё С‚СЂРѕРµ, РІ Р°Р»С„Р°РІРёС‚РЅРѕРј РїРѕСЂСЏРґРєРµ
        self.assertEqual(
            display_names,
            sorted([u1.profile.display_name, u2.profile.display_name, u3.profile.display_name]),
        )

    # ---------- PublicUserByDisplayNameView ----------

    def test_public_user_by_display_name_active_user(self):
        """
        PublicUserByDisplayNameView:
        - РЅР°С…РѕРґРёС‚ Р°РєС‚РёРІРЅРѕРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ РїРѕ display_name (Р±РµР· СѓС‡С‘С‚Р° СЂРµРіРёСЃС‚СЂР°)
        """
        user = self._create_user_with_profile("u@example.com", "TestUser", is_active=True)

        # Р”Р»СЏ СЌС‚РѕРіРѕ СѓСЂР»Р° РЅРµС‚ name РІ urls, РїРѕСЌС‚РѕРјСѓ РїСѓС‚СЊ СЂСѓРєР°РјРё.
        # Р“Р»РѕР±Р°Р»СЊРЅС‹Р№ РїСЂРµС„РёРєСЃ: path('userApi/users/', include('apps.users.urls'))
        url = f"/userApi/users/u/{user.profile.display_name.lower()}"
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_200_OK, resp.data)
        self.assertEqual(resp.data["id"], user.id)
        self.assertEqual(resp.data["profile"]["display_name"], user.profile.display_name)

    def test_public_user_by_display_name_ignores_inactive_users(self):
        """
        Р•СЃР»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃ С‚Р°РєРёРј display_name РЅРµР°РєС‚РёРІРµРЅ (is_active=False) в†’ 404.
        """
        user = self._create_user_with_profile("u2@example.com", "HiddenUser", is_active=False)

        url = f"/userApi/users/u/{user.profile.display_name}"
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_public_user_by_display_name_not_found(self):
        """
        Р•СЃР»Рё РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ СЃ С‚Р°РєРёРј display_name РЅРµС‚ в†’ 404.
        """
        url = "/userApi/users/u/no-such-user"
        resp = self.client.get(url)

        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)
