from __future__ import annotations

from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.test import SimpleTestCase

from core.common_services.antispam import (
    CacheAntiSpamPolicy,
    CacheAntiSpamService,
    build_antispam_fingerprint,
)


class _User:
    id = 42
    is_authenticated = True
    is_staff = False


class _StaffUser(_User):
    is_staff = True


class CacheAntiSpamServiceTests(SimpleTestCase):
    def setUp(self):
        cache.clear()
        self.service = CacheAntiSpamService(
            CacheAntiSpamPolicy(
                namespace="test",
                action="publish",
                cooldown_seconds=10,
                window_seconds=60,
                max_actions_per_window=2,
                duplicate_window_seconds=30,
            )
        )

    def test_fingerprint_normalizes_case_and_whitespace(self):
        self.assertEqual(
            build_antispam_fingerprint("  РЎС…РѕР¶РёР№   С‚РµРєСЃС‚ "),
            build_antispam_fingerprint("СЃС…РѕР¶РёР№ С‚РµРєСЃС‚"),
        )

    def test_mark_blocks_immediate_repeat(self):
        self.service.check(user=_User(), text_parts=("РўРµРєСЃС‚",))
        self.service.mark(user=_User(), text_parts=("РўРµРєСЃС‚",))

        with self.assertRaises(ValidationError):
            self.service.check(user=_User(), text_parts=("РўРµРєСЃС‚",))

    def test_staff_is_exempt(self):
        self.service.mark(user=_StaffUser(), text_parts=("РўРµРєСЃС‚",))
        self.service.check(user=_StaffUser(), text_parts=("РўРµРєСЃС‚",))
