from __future__ import annotations

from django.utils import timezone


TERMS_VERSION = "2026-06-27"
PRIVACY_VERSION = "2026-06-27"


def request_ip(request) -> str | None:
    if request is None:
        return None

    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded:
        return forwarded.split(",", 1)[0].strip()

    return request.META.get("REMOTE_ADDR") or None


def request_user_agent(request) -> str:
    if request is None:
        return ""

    return (request.META.get("HTTP_USER_AGENT") or "")[:255]


def consent_timestamp():
    return timezone.now()


def user_terms_payload(request=None) -> dict:
    return {
        "terms_accepted_at": consent_timestamp(),
        "terms_version": TERMS_VERSION,
        "privacy_version": PRIVACY_VERSION,
        "terms_acceptance_ip": request_ip(request),
        "terms_acceptance_user_agent": request_user_agent(request),
    }


def order_terms_payload(request=None) -> dict:
    return {
        "checkout_terms_accepted_at": consent_timestamp(),
        "checkout_terms_version": TERMS_VERSION,
        "checkout_terms_acceptance_ip": request_ip(request),
        "checkout_terms_acceptance_user_agent": request_user_agent(request),
    }
