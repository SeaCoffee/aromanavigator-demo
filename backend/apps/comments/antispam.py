from __future__ import annotations

from django.conf import settings

from core.common_services.antispam import CacheAntiSpamPolicy, CacheAntiSpamService


COMMENT_ANTISPAM = CacheAntiSpamService(
    CacheAntiSpamPolicy(
        namespace="comments",
        action="create",
        cooldown_seconds=getattr(settings, "COMMENTS_COOLDOWN_SECONDS", 15),
        window_seconds=60 * 60,
        max_actions_per_window=getattr(settings, "COMMENTS_HOUR_LIMIT", 60),
        duplicate_window_seconds=getattr(
            settings,
            "COMMENTS_DUPLICATE_WINDOW_SECONDS",
            10 * 60,
        ),
        staff_exempt=getattr(settings, "COMMENTS_ANTISPAM_STAFF_EXEMPT", True),
    )
)


def check_comment_antispam(*, user, body: str) -> None:
    COMMENT_ANTISPAM.check(user=user, text_parts=(body,))


def mark_comment_antispam(*, user, body: str) -> None:
    COMMENT_ANTISPAM.mark(user=user, text_parts=(body,))
