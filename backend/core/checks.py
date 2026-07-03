from __future__ import annotations

from pathlib import Path

from django.conf import settings
from django.core.checks import Error, Warning, Tags, register


LOCAL_HOSTS = {"localhost", "127.0.0.1", "0.0.0.0", "testserver", "app"}
LOCAL_ORIGINS = {
    "http://localhost:3000",
    "http://127.0.0.1:3000",
}


def _as_path(value) -> Path | None:
    if not value:
        return None

    try:
        return Path(value).resolve()
    except TypeError:
        return None


def _has_only_local_hosts(hosts: list[str]) -> bool:
    return bool(hosts) and set(hosts).issubset(LOCAL_HOSTS)


def _has_local_origin(values: list[str]) -> bool:
    return bool(set(values or []) & LOCAL_ORIGINS)


@register(Tags.security, deploy=True)
def production_security_settings_check(app_configs, **kwargs):
    if settings.DEBUG:
        return []

    issues = []
    secret_key = str(getattr(settings, "SECRET_KEY", "") or "")

    if not secret_key:
        issues.append(
            Error(
                "SECRET_KEY is empty.",
                hint="Set a long, unique SECRET_KEY in the production environment.",
                id="aroma.E001",
            )
        )
    elif secret_key.startswith("django-insecure-"):
        issues.append(
            Error(
                "SECRET_KEY uses Django's insecure development prefix.",
                hint="Rotate SECRET_KEY before deploying.",
                id="aroma.E002",
            )
        )

    if _has_only_local_hosts(list(getattr(settings, "ALLOWED_HOSTS", []))):
        issues.append(
            Error(
                "ALLOWED_HOSTS contains only local/development hosts.",
                hint="Set DJANGO_ALLOWED_HOSTS to the production domain(s).",
                id="aroma.E003",
            )
        )

    if _has_local_origin(list(getattr(settings, "CORS_ALLOWED_ORIGINS", []))):
        issues.append(
            Warning(
                "CORS_ALLOWED_ORIGINS contains local development origins.",
                hint="Set CORS_ALLOWED_ORIGINS to the production frontend origin(s).",
                id="aroma.W001",
            )
        )

    if _has_local_origin(list(getattr(settings, "CSRF_TRUSTED_ORIGINS", []))):
        issues.append(
            Warning(
                "CSRF_TRUSTED_ORIGINS contains local development origins.",
                hint="Set CSRF_TRUSTED_ORIGINS to the production frontend origin(s).",
                id="aroma.W002",
            )
        )

    if not getattr(settings, "SESSION_COOKIE_SECURE", False):
        issues.append(
            Error(
                "SESSION_COOKIE_SECURE is disabled.",
                hint="Use secure cookies in production.",
                id="aroma.E004",
            )
        )

    if not getattr(settings, "CSRF_COOKIE_SECURE", False):
        issues.append(
            Error(
                "CSRF_COOKIE_SECURE is disabled.",
                hint="Use secure CSRF cookies in production.",
                id="aroma.E005",
            )
        )

    return issues


@register(Tags.security)
def media_storage_safety_check(app_configs, **kwargs):
    issues = []
    public_root = _as_path(getattr(settings, "PUBLIC_MEDIA_ROOT", None))
    private_root = _as_path(getattr(settings, "PRIVATE_MEDIA_ROOT", None))

    if public_root and private_root:
        try:
            private_root.relative_to(public_root)
        except ValueError:
            pass
        else:
            issues.append(
                Error(
                    "PRIVATE_MEDIA_ROOT is inside PUBLIC_MEDIA_ROOT.",
                    hint=(
                        "Store private files outside the public media root, "
                        "or use a separate private storage backend."
                    ),
                    id="aroma.E006",
                )
            )

    private_options = getattr(settings, "PRIVATE_MEDIA_STORAGE_OPTIONS", {}) or {}
    if private_options.get("base_url"):
        issues.append(
            Error(
                "Private media storage has a public base_url.",
                hint="Private files must be served only through protected Django views.",
                id="aroma.E007",
            )
        )

    return issues
