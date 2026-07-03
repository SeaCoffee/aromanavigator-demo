from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


User = get_user_model()


class AnnouncementAdminPermissionTests(APITestCase):
    def test_suspended_staff_cannot_create_announcement(self):
        user = User.objects.create_user(
            email="suspended-announcement-admin@example.com",
            password="password",
            is_staff=True,
            suspended_indefinitely=True,
        )
        self.client.force_authenticate(user)

        response = self.client.post(
            "/userApi/notifications/admin/announcements",
            {"title": "Maintenance", "body": "Scheduled maintenance"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)
