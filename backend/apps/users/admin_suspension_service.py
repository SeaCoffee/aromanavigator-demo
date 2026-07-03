from __future__ import annotations

from django.db.transaction import atomic
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.users.models import UserModel, UserSuspension
from apps.users.user_role_service import UserRoleService
from core.validators.suspension_validators import normalize_suspension_until


class AdminSuspensionService:
    END_REASON_MANUAL = "manual"
    END_REASON_EXPIRED = "expired"
    END_REASON_REPLACED = "replaced"

    @staticmethod
    def _lock_target(target: UserModel) -> UserModel:
        return UserModel.objects.select_for_update().get(pk=target.pk)

    @staticmethod
    def _validate_admin_can_suspend(*, admin: UserModel, target: UserModel) -> None:
        if not UserRoleService.can_manage_user(actor=admin, target=target):
            raise ValidationError(
                "РќРµРґРѕСЃС‚Р°С‚РЅСЊРѕ РїСЂР°РІ РґР»СЏ Р±Р»РѕРєСѓРІР°РЅРЅСЏ С†СЊРѕРіРѕ РєРѕСЂРёСЃС‚СѓРІР°С‡Р°."
            )

    @staticmethod
    def _validate_admin_can_unsuspend(*, admin: UserModel, target: UserModel) -> None:
        if not UserRoleService.can_manage_user(actor=admin, target=target):
            raise ValidationError(
                "РќРµРґРѕСЃС‚Р°С‚РЅСЊРѕ РїСЂР°РІ РґР»СЏ СЂРѕР·Р±Р»РѕРєСѓРІР°РЅРЅСЏ С†СЊРѕРіРѕ РєРѕСЂРёСЃС‚СѓРІР°С‡Р°."
            )

    @staticmethod
    def _normalize_until_or_raise(*, until, permanent: bool):
        if permanent:
            return None

        normalized_until = normalize_suspension_until(until)

        if normalized_until is None:
            raise ValidationError(
                {
                    "until": (
                        "Р’РєР°Р¶С–С‚СЊ РґР°С‚Сѓ/С‡Р°СЃ Р·Р°РІРµСЂС€РµРЅРЅСЏ Р±Р»РѕРєСѓРІР°РЅРЅСЏ "
                        "Р°Р±Рѕ permanent=true."
                    )
                }
            )

        if normalized_until <= timezone.now():
            raise ValidationError(
                {"until": "Р”Р°С‚Р° Р·Р°РІРµСЂС€РµРЅРЅСЏ Р±Р»РѕРєСѓРІР°РЅРЅСЏ РјР°С” Р±СѓС‚Рё РІ РјР°Р№Р±СѓС‚РЅСЊРѕРјСѓ."}
            )

        return normalized_until

    @staticmethod
    def _close_active_history(
        *,
        target: UserModel,
        now,
        ended_by: UserModel | None,
        end_reason: str,
    ) -> int:
        return (
            UserSuspension.objects
            .filter(target=target, ended_at__isnull=True)
            .update(
                ended_at=now,
                ended_by=ended_by,
                end_reason=end_reason,
                updated_at=now,
            )
        )

    @staticmethod
    def _apply_user_snapshot(
        *,
        target: UserModel,
        until,
        permanent: bool,
        reason: str,
        admin: UserModel,
    ) -> None:
        target.suspended_until = until
        target.suspended_indefinitely = permanent
        target.suspended_reason = reason
        target.suspended_by = admin

        target.save(
            update_fields=[
                "suspended_until",
                "suspended_indefinitely",
                "suspended_reason",
                "suspended_by",
                "updated_at",
            ]
        )

    @staticmethod
    def _clear_user_snapshot(target: UserModel) -> None:
        changed_fields: list[str] = []

        if target.suspended_until is not None:
            target.suspended_until = None
            changed_fields.append("suspended_until")

        if target.suspended_indefinitely:
            target.suspended_indefinitely = False
            changed_fields.append("suspended_indefinitely")

        if target.suspended_reason:
            target.suspended_reason = ""
            changed_fields.append("suspended_reason")

        if target.suspended_by_id is not None:
            target.suspended_by = None
            changed_fields.append("suspended_by")

        if changed_fields:
            changed_fields.append("updated_at")
            target.save(update_fields=changed_fields)

    @staticmethod
    @atomic
    def suspend(
        admin: UserModel,
        target: UserModel,
        until=None,
        *,
        permanent: bool = False,
        reason: str = "",
    ) -> UserModel:
        target = AdminSuspensionService._lock_target(target)

        AdminSuspensionService._validate_admin_can_suspend(
            admin=admin,
            target=target,
        )

        now = timezone.now()
        clean_reason = (reason or "").strip()[:255]

        normalized_until = AdminSuspensionService._normalize_until_or_raise(
            until=until,
            permanent=permanent,
        )

        AdminSuspensionService._close_active_history(
            target=target,
            now=now,
            ended_by=admin,
            end_reason=AdminSuspensionService.END_REASON_REPLACED,
        )

        UserSuspension.objects.create(
            target=target,
            admin=admin,
            reason=clean_reason,
            started_at=now,
            until=normalized_until,
        )

        AdminSuspensionService._apply_user_snapshot(
            target=target,
            until=normalized_until,
            permanent=permanent,
            reason=clean_reason,
            admin=admin,
        )

        return target

    @staticmethod
    @atomic
    def unsuspend(
        admin: UserModel,
        target: UserModel,
    ) -> UserModel:
        target = AdminSuspensionService._lock_target(target)

        AdminSuspensionService._validate_admin_can_unsuspend(
            admin=admin,
            target=target,
        )

        now = timezone.now()

        AdminSuspensionService._close_active_history(
            target=target,
            now=now,
            ended_by=admin,
            end_reason=AdminSuspensionService.END_REASON_MANUAL,
        )

        AdminSuspensionService._clear_user_snapshot(target)

        return target

    @staticmethod
    @atomic
    def cleanup_expired(target: UserModel) -> bool:
        target = AdminSuspensionService._lock_target(target)

        if target.suspended_indefinitely:
            return False

        if not target.suspended_until:
            return False

        now = timezone.now()
        suspended_until = normalize_suspension_until(target.suspended_until)

        if suspended_until and suspended_until > now:
            return False

        AdminSuspensionService._close_active_history(
            target=target,
            now=now,
            ended_by=None,
            end_reason=AdminSuspensionService.END_REASON_EXPIRED,
        )

        AdminSuspensionService._clear_user_snapshot(target)

        return True
