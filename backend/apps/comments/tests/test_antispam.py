from __future__ import annotations

from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.test import TestCase

from apps.comments.antispam import (
    check_comment_antispam,
    mark_comment_antispam,
)
from apps.users.models import UserModel


class CommentAntiSpamTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = UserModel.objects.create_user(
            email="commenter@example.com",
            is_active=True,
        )

    def test_blocks_immediate_duplicate(self):
        body = "РћРґРёРЅ С– С‚РѕР№ СЃР°РјРёР№ РєРѕРјРµРЅС‚Р°СЂ"

        check_comment_antispam(user=self.user, body=body)
        mark_comment_antispam(user=self.user, body=body)

        with self.assertRaises(ValidationError):
            check_comment_antispam(user=self.user, body=body)

    def test_staff_user_is_exempt(self):
        staff = UserModel.objects.create_user(
            email="staff-commenter@example.com",
            is_active=True,
            is_staff=True,
        )
        body = "РџРѕРІС‚РѕСЂ РґР»СЏ РјРѕРґРµСЂР°С‚РѕСЂР°"

        check_comment_antispam(user=staff, body=body)
        mark_comment_antispam(user=staff, body=body)
        check_comment_antispam(user=staff, body=body)
