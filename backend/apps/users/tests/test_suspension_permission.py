# apps/users/tests/test_suspension_permission.py
from datetime import timedelta
from rest_framework.test import APITestCase, APIClient
from django.utils import timezone

from apps.users.models import UserModel
from apps.users.admin_suspension_service import AdminSuspensionService


class SuspensionPermissionTests(APITestCase):
    def setUp(self):
        self.user = UserModel.objects.create_user(
            email="user@test.com", password="x", is_active=True
        )
        self.admin = UserModel.objects.create_user(
            email="admin@test.com", password="x", is_active=True, is_staff=True
        )
        self.client = APIClient()

    def test_suspended_user_gets_403_on_private_endpoint(self):
        until = timezone.now() + timedelta(minutes=10)
        AdminSuspensionService.suspend(self.admin, self.user, until, reason="tmp")

        self.user.refresh_from_db()
        self.client.force_authenticate(self.user)

        # РїРѕРґСЃС‚Р°РІСЊ СЃСЋРґР° Р»СЋР±РѕР№ РїСЂРёРІР°С‚РЅС‹Р№ СЌРЅРґРїРѕРёРЅС‚, РіРґРµ СЃС‚РѕРёС‚ IsNotSuspended
        resp = self.client.patch("/userApi/users/me/update", data={"email": "x@y.z"}, format="json")
        self.assertEqual(resp.status_code, 403)
        self.assertIn("suspended_until", resp.data)
