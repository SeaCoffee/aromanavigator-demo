from __future__ import annotations

import logging

from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.exchange.models import ExchangeProposalModel
from apps.photos.models import ObjectCoverModel
from apps.social.social_service import SocialService
from apps.users.models import ProfileModel
from core.choises.account_choise import AccountTypes
from core.choises.exchange_status import ExchangeStatus
from core.choises.region_choise import RegionChoices
from core.common_services.email_service import EmailService
from core.common_services.jwt_service import JWTService
from core.enums.role_groups_enum import UserRoles


logger = logging.getLogger(__name__)


class UserAccountService:
    @staticmethod
    def _validate_can_delete(user) -> None:
        if user.is_staff or user.is_superuser:
            raise ValidationError(
                {
                    "detail": (
                        "Р РѕР±РѕС‡РёР№ РѕР±Р»С–РєРѕРІРёР№ Р·Р°РїРёСЃ Р°РґРјС–РЅС–СЃС‚СЂР°С†С–С— РЅРµ РјРѕР¶РЅР° РІРёРґР°Р»РёС‚Рё "
                        "С‡РµСЂРµР· РєРѕСЂРёСЃС‚СѓРІР°С†СЊРєС– РЅР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ."
                    )
                }
            )

        if ExchangeProposalModel.objects.filter(
            Q(proposer=user) | Q(owner=user),
            status=ExchangeStatus.PENDING,
        ).exists():
            raise ValidationError(
                {
                    "detail": (
                        "РќРµРјРѕР¶Р»РёРІРѕ РІРёРґР°Р»РёС‚Рё Р°РєР°СѓРЅС‚, РґРѕРєРё С” РїСЂРѕРїРѕР·РёС†С–С— РѕР±РјС–РЅСѓ "
                        "Р±РµР· РІС–РґРїРѕРІС–РґС–."
                    )
                }
            )

    @staticmethod
    def _delete_private_state(user, profile) -> None:
        social_counter_user_ids = {
            user.pk,
            *user.following.values_list("followee_id", flat=True),
            *user.followers.values_list("follower_id", flat=True),
        }

        if profile:
            profile_ct = ContentType.objects.get_for_model(ProfileModel)
            ObjectCoverModel.objects.filter(
                content_type=profile_ct,
                object_id=profile.pk,
            ).delete()

        for related_name in (
            "notifications",
            "read_notification_announcements",
            "following",
            "followers",
            "blocks_out",
            "blocks_in",
            "subscriptions",
        ):
            related = getattr(user, related_name, None)
            if related is not None:
                related.all().delete()

        taste_profile = getattr(user, "taste_profile", None)
        if taste_profile is not None:
            taste_profile.delete()

        for user_id in social_counter_user_ids:
            SocialService.recount_counts(user_id)

    @staticmethod
    @transaction.atomic
    def delete_self(user) -> None:
        user = type(user).objects.select_for_update().get(pk=user.pk)
        UserAccountService._validate_can_delete(user)

        user_email = user.email
        user_id = user.id
        user_name = (
            getattr(getattr(user, "profile", None), "name", "")
            or "РљРѕСЂРёСЃС‚СѓРІР°С‡"
        )

        JWTService.blacklist_user_tokens(user)

        profile = getattr(user, "profile", None)
        UserAccountService._delete_private_state(user, profile)

        if profile:
            profile.name = "Видалений користувач"
            profile.display_name = f"deleted-user-{user_id}"
            profile.region = RegionChoices.OTHER
            profile.about_me = None
            profile.save(update_fields=["name", "display_name", "region", "about_me"])

        user.social_accounts.all().delete()
        user.email = f"deleted-{user_id}@invalid.local"
        user.email_verified = False
        user.is_active = False
        user.is_staff = False
        user.is_seller = False
        user.is_upgrade_to_premium = False
        user.account_type = AccountTypes.BASIC
        user.role = UserRoles.USER.value
        user.deleted_at = timezone.now()
        user.suspended_until = None
        user.suspended_reason = ""
        user.suspended_by = None
        user.suspended_indefinitely = False
        user.set_unusable_password()
        user.save()

        transaction.on_commit(
            lambda: UserAccountService._send_account_deleted_email(
                email=user_email,
                name=user_name,
                user_id=user_id,
            )
        )

    @staticmethod
    def _send_account_deleted_email(
        *,
        email: str,
        name: str,
        user_id: int,
    ) -> None:
        try:
            EmailService.send_html(
                to=email,
                template_name="delete_account.html",
                context={"name": name},
                subject="РђРєР°СѓРЅС‚ Aroma Navigator РІРёРґР°Р»РµРЅРѕ",
            )
        except Exception:
            logger.exception(
                "Failed to send account deletion email for user_id=%s",
                user_id,
            )
