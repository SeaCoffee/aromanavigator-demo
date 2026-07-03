from __future__ import annotations

from django.conf import settings

from core.common_services.antispam import CacheAntiSpamPolicy, CacheAntiSpamService


TOPIC_ANTISPAM = CacheAntiSpamService(
    CacheAntiSpamPolicy(
        namespace="forum",
        action="topic_create",
        cooldown_seconds=getattr(settings, "FORUM_TOPIC_COOLDOWN_SECONDS", 60),
        window_seconds=60 * 60,
        max_actions_per_window=getattr(settings, "FORUM_TOPIC_HOUR_LIMIT", 10),
        duplicate_window_seconds=getattr(
            settings,
            "FORUM_TOPIC_DUPLICATE_WINDOW_SECONDS",
            10 * 60,
        ),
        staff_exempt=getattr(settings, "FORUM_ANTISPAM_STAFF_EXEMPT", True),
    )
)


def check_topic_antispam(*, user, title: str, content: str) -> None:
    TOPIC_ANTISPAM.check(user=user, text_parts=(title, content))


def mark_topic_antispam(*, user, title: str, content: str) -> None:
    TOPIC_ANTISPAM.mark(user=user, text_parts=(title, content))
