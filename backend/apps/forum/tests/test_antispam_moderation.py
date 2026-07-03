from __future__ import annotations

from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.test import TestCase

from apps.forum.anti_spam import check_topic_antispam, mark_topic_antispam
from core.profanity_filter import censor_profanity
from apps.users.models import UserModel


class ForumAntiSpamModerationTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = UserModel.objects.create_user(
            email="commenter@example.com",
            is_active=True,
        )

    def test_topic_antispam_blocks_immediate_duplicate(self):
        title = "РћРґРЅР° С‚РµРјР°"
        content = "РћРґРёРЅ С– С‚РѕР№ СЃР°РјРёР№ Р·РјС–СЃС‚"

        check_topic_antispam(user=self.user, title=title, content=content)
        mark_topic_antispam(user=self.user, title=title, content=content)

        with self.assertRaises(ValidationError):
            check_topic_antispam(user=self.user, title=title, content=content)

    def test_staff_user_is_antispam_exempt(self):
        staff = UserModel.objects.create_user(
            email="staff@example.com",
            is_active=True,
            is_staff=True,
        )
        title = "РўРµРјР° РјРѕРґРµСЂР°С‚РѕСЂР°"
        content = "РџРѕРІС‚РѕСЂ РґР»СЏ РјРѕРґРµСЂР°С‚РѕСЂР°"

        check_topic_antispam(user=staff, title=title, content=content)
        mark_topic_antispam(user=staff, title=title, content=content)
        check_topic_antispam(user=staff, title=title, content=content)

    def test_profanity_filter_masks_obvious_word(self):
        result = censor_profanity("Р¦Рµ СЃСѓРєР° РїРѕРіР°РЅРёР№ С‚РµРєСЃС‚")

        self.assertTrue(result.has_profanity)
        self.assertIn("****", result.censored)
        self.assertNotIn("СЃСѓРєР°", result.censored.lower())
