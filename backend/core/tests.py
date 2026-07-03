from django.contrib.auth import get_user_model
from django.core.checks import Tags, run_checks
from django.test import SimpleTestCase, override_settings
from rest_framework.test import APITestCase

from core.models import (
    FeedbackMessageModel,
    SiteContactSettingsModel,
    SiteFaqModel,
    SitePageModel,
)

User = get_user_model()


class SecurityConfigurationChecksTests(SimpleTestCase):
    @override_settings(
        DEBUG=False,
        SECRET_KEY="django-insecure-test",
        ALLOWED_HOSTS=["localhost", "127.0.0.1"],
        SESSION_COOKIE_SECURE=True,
        CSRF_COOKIE_SECURE=True,
        PUBLIC_MEDIA_ROOT="/tmp/aroma-public-media",
        PRIVATE_MEDIA_ROOT="/tmp/aroma-private-media",
        PRIVATE_MEDIA_STORAGE_OPTIONS={"location": "/tmp/aroma-private-media", "base_url": None},
    )
    def test_deploy_check_rejects_insecure_secret_and_local_hosts(self):
        issues = run_checks(tags=[Tags.security], include_deployment_checks=True)
        issue_ids = {issue.id for issue in issues}

        self.assertIn("aroma.E002", issue_ids)
        self.assertIn("aroma.E003", issue_ids)

    @override_settings(
        PUBLIC_MEDIA_ROOT="/tmp/aroma-media",
        PRIVATE_MEDIA_ROOT="/tmp/aroma-media/private",
        PRIVATE_MEDIA_STORAGE_OPTIONS={"location": "/tmp/aroma-media/private", "base_url": None},
    )
    def test_private_media_must_not_live_inside_public_media(self):
        issues = run_checks(tags=[Tags.security])
        issue_ids = {issue.id for issue in issues}

        self.assertIn("aroma.E006", issue_ids)


class SiteContentApiTests(APITestCase):
    def setUp(self):
        SitePageModel.objects.get_or_create(
            slug="about",
            defaults={"title": "РџСЂРѕ РЅР°СЃ", "body": "РўРµРєСЃС‚", "is_published": True},
        )

    def test_public_content_and_page_are_available(self):
        SiteContactSettingsModel.load()

        content_response = self.client.get("/userApi/core/site-content")
        page_response = self.client.get("/userApi/core/site-pages/about")

        self.assertEqual(content_response.status_code, 200)
        self.assertIn("contacts", content_response.data)
        self.assertEqual(page_response.status_code, 200)
        self.assertEqual(page_response.data["slug"], "about")

    def test_public_feedback_creates_new_message(self):
        response = self.client.post(
            "/userApi/core/feedback",
            {
                "name": "Visitor",
                "email": "visitor@example.com",
                "subject": "Question",
                "message": "Please contact me",
                "source_path": "/contacts",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        message = FeedbackMessageModel.objects.get()
        self.assertEqual(message.status, "new")
        self.assertEqual(message.source_path, "/contacts")

    def test_feedback_honeypot_rejects_bot_submission(self):
        response = self.client.post(
            "/userApi/core/feedback",
            {
                "name": "Bot",
                "email": "bot@example.com",
                "subject": "Spam",
                "message": "Spam",
                "website": "https://spam.example.com",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(FeedbackMessageModel.objects.exists())

    def test_regular_user_cannot_manage_site_content(self):
        user = User.objects.create_user(email="site-content-user@example.com")
        self.client.force_authenticate(user)

        response = self.client.patch(
            "/userApi/core/admin/site-content",
            {"contact_email": "support@example.com"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_staff_can_manage_contacts_faq_and_feedback(self):
        user = User.objects.create_user(
            email="site-content-admin@example.com",
            role="admin",
            is_staff=True,
        )
        feedback = FeedbackMessageModel.objects.create(
            name="Visitor",
            email="visitor@example.com",
            subject="Question",
            message="Message",
        )
        self.client.force_authenticate(user)

        contacts_response = self.client.patch(
            "/userApi/core/admin/site-content",
            {"contact_email": "support@example.com"},
            format="json",
        )
        faq_response = self.client.post(
            "/userApi/core/admin/faq",
            {
                "question": "How?",
                "answer": "Like this.",
                "position": 1,
                "is_active": True,
            },
            format="json",
        )
        feedback_response = self.client.patch(
            f"/userApi/core/admin/feedback/{feedback.id}",
            {"status": "resolved", "admin_note": "Answered"},
            format="json",
        )

        self.assertEqual(contacts_response.status_code, 200)
        self.assertEqual(faq_response.status_code, 201)
        self.assertEqual(feedback_response.status_code, 200)
        self.assertTrue(SiteFaqModel.objects.filter(question="How?").exists())
        feedback.refresh_from_db()
        self.assertEqual(feedback.status, "resolved")
