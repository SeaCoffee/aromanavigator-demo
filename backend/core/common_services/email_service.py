from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from django.db import transaction

from configs.celery import app
from core.common_services.jwt_service import (
    ActivateToken,
    JWTService,
    RecoveryToken,
)


def _build_frontend_url(path: str) -> str:
    base = settings.FRONTEND_URL.rstrip("/")
    normalized_path = path if path.startswith("/") else f"/{path}"
    return f"{base}{normalized_path}"


@app.task(name="email.send_html")
def _send_html_email(to: str, template_name: str, context: dict, subject: str) -> None:
    template = get_template(template_name)
    html_content = template.render(context)

    msg = EmailMultiAlternatives(
        to=[to],
        from_email=settings.DEFAULT_FROM_EMAIL,
        subject=subject,
    )
    msg.attach_alternative(html_content, mimetype="text/html")
    msg.send()


def _user_display_name(user) -> str:
    try:
        profile = user.profile
        name = getattr(profile, "name", "") or getattr(profile, "display_name", "")
        return name or user.email
    except ObjectDoesNotExist:
        return user.email


class EmailService:
    @staticmethod
    def send_html(*, to: str, subject: str, template_name: str, context: dict) -> None:
        transaction.on_commit(
            lambda: _send_html_email.delay(
                to=to,
                template_name=template_name,
                context=context,
                subject=subject,
            )
        )

    @classmethod
    def register(cls, user):
        token = JWTService.create_action_token(user, ActivateToken)

        cls.send_html(
            to=user.email,
            template_name="register.html",
            context={
                "name": _user_display_name(user),
                "url": _build_frontend_url(f"/activate/{token}"),
            },
            subject="РџС–РґС‚РІРµСЂРґР¶РµРЅРЅСЏ СЂРµС”СЃС‚СЂР°С†С–С— РІ Aroma Navigator",
        )

    @classmethod
    def recovery(cls, user):
        token = JWTService.create_action_token(user, RecoveryToken)

        cls.send_html(
            to=user.email,
            template_name="recovery.html",
            context={
                "name": _user_display_name(user),
                "url": _build_frontend_url(f"/recovery/{token}"),
            },
            subject="Р’С–РґРЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ РІ Aroma Navigator",
        )

    @classmethod
    def account_deletion(cls, user):
        cls.send_html(
            to=user.email,
            template_name="delete_account.html",
            context={"name": _user_display_name(user)},
            subject="РђРєР°СѓРЅС‚ Aroma Navigator РІРёРґР°Р»РµРЅРѕ",
        )

    @classmethod
    def password_changed(cls, user):
        cls.send_html(
            to=user.email,
            template_name="password_changed.html",
            context={
                "name": _user_display_name(user),
                "recovery_url": _build_frontend_url("/recovery"),
            },
            subject="РџР°СЂРѕР»СЊ Aroma Navigator Р·РјС–РЅРµРЅРѕ",
        )
