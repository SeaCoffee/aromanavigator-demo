from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone

from core.choises.account_choise import AccountTypes
from core.choises.region_choise import RegionChoices
from core.choises.social_providers_choise import SocialProvider
from core.enums.role_groups_enum import UserRoles
from core.models import BaseModel
from core.validators.profile_validators import (
    display_name_ci,
    normalize_display_name,
)

from .managers import UserManager


class UserModel(BaseModel, AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    email_verified = models.BooleanField(default=False)

    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)

    account_type = models.CharField(
        max_length=10,
        choices=AccountTypes,
        default="basic",
    )

    is_seller = models.BooleanField(default=False, db_index=True)
    is_upgrade_to_premium = models.BooleanField(default=False)

    last_logout = models.DateTimeField(null=True, blank=True)

    terms_accepted_at = models.DateTimeField(null=True, blank=True)
    terms_version = models.CharField(max_length=32, blank=True)
    privacy_version = models.CharField(max_length=32, blank=True)
    terms_acceptance_ip = models.GenericIPAddressField(null=True, blank=True)
    terms_acceptance_user_agent = models.CharField(max_length=255, blank=True)

    role = models.CharField(
        max_length=20,
        choices=UserRoles.choices(),
        default=UserRoles.USER.value,
        db_index=True,
    )

    suspended_until = models.DateTimeField(null=True, blank=True)
    suspended_reason = models.CharField(max_length=255, blank=True, default="")
    suspended_by = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="current_suspensions_given",
    )
    suspended_indefinitely = models.BooleanField(default=False, db_index=True)

    USERNAME_FIELD = "email"

    objects = UserManager()

    class Meta:
        db_table = "auth_user"
        indexes = [
            models.Index(fields=["is_active"], name="idx_user_is_active"),
            models.Index(fields=["suspended_until"], name="idx_user_suspended_until"),
            models.Index(fields=["suspended_indefinitely"], name="idx_user_susp_indef"),
            models.Index(fields=["role", "is_active"], name="idx_user_role_active"),
        ]

    @property
    def is_suspended(self) -> bool:
        if self.suspended_indefinitely:
            return True

        return bool(self.suspended_until and self.suspended_until > timezone.now())

    @property
    def suspension_seconds_left(self) -> int | None:
        if self.suspended_indefinitely:
            return None

        if not self.suspended_until:
            return 0

        seconds = int((self.suspended_until - timezone.now()).total_seconds())

        return max(0, seconds)


class ProfileModel(BaseModel):
    user = models.OneToOneField(
        UserModel,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    name = models.CharField(max_length=25)

    display_name = models.CharField(max_length=55, unique=True)

    display_name_ci = models.CharField(
        max_length=55,
        unique=True,
        db_index=True,
        editable=False,
    )

    region = models.CharField(
        max_length=30,
        choices=RegionChoices.choices,
        default=RegionChoices.OTHER,
    )

    about_me = models.TextField(
        max_length=355,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = "users_profile"
        ordering = ["id"]

    def save(self, *args, **kwargs):
        self.display_name = normalize_display_name(self.display_name)
        self.display_name_ci = display_name_ci(self.display_name)

        update_fields = kwargs.get("update_fields")

        if update_fields is not None:
            normalized_update_fields = set(update_fields)

            if "display_name" in normalized_update_fields:
                normalized_update_fields.add("display_name_ci")

            kwargs["update_fields"] = list(normalized_update_fields)

        super().save(*args, **kwargs)


class SocialAccountModel(BaseModel):
    user = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        related_name="social_accounts",
    )

    provider = models.CharField(
        max_length=20,
        choices=SocialProvider.choices,
    )

    provider_user_id = models.CharField(max_length=255)

    email = models.EmailField(
        blank=True,
        default="",
        help_text="Email, РѕС‚СЂРёРјР°РЅРёР№ РІС–Рґ OAuth provider. Р”Р¶РµСЂРµР»Рѕ С–СЃС‚РёРЅРё вЂ” UserModel.email.",
    )

    class Meta:
        db_table = "social_account"
        constraints = [
            models.UniqueConstraint(
                fields=["provider", "provider_user_id"],
                name="uniq_social_provider_user",
            ),
        ]
        indexes = [
            models.Index(fields=["user", "provider"], name="idx_social_user_provider"),
            models.Index(fields=["provider", "provider_user_id"], name="idx_social_provider_extid"),
        ]

    def __str__(self) -> str:
        return f"{self.provider}:{self.provider_user_id} -> {self.user_id}"


class UserStatsModel(BaseModel):
    user = models.OneToOneField(
        UserModel,
        on_delete=models.CASCADE,
        related_name="stats",
    )

    followers_count = models.PositiveIntegerField(default=0)
    following_count = models.PositiveIntegerField(default=0)

    notifications_unread_count = models.PositiveIntegerField(default=0)
    last_notifications_read_at = models.DateTimeField(null=True, blank=True)

    messages_unread_count = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(default=timezone.now, db_index=True)

    forum_topics_count = models.PositiveIntegerField(default=0)
    forum_comments_count = models.PositiveIntegerField(default=0)
    likes_given_count = models.PositiveIntegerField(default=0)
    likes_received_count = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "user_stats"


class UserSuspension(BaseModel):
    target = models.ForeignKey(
        UserModel,
        on_delete=models.CASCADE,
        related_name="suspensions",
        db_index=True,
    )

    admin = models.ForeignKey(
        UserModel,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="suspensions_made",
    )

    reason = models.CharField(max_length=255, blank=True, default="")
    started_at = models.DateTimeField(default=timezone.now, db_index=True)

    until = models.DateTimeField(null=True, blank=True, db_index=True)

    ended_at = models.DateTimeField(null=True, blank=True, db_index=True)
    ended_by = models.ForeignKey(
        UserModel,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="unsuspensions_made",
    )
    end_reason = models.CharField(max_length=32, blank=True, default="")

    class Meta:
        db_table = "user_suspension"
        indexes = [
            models.Index(fields=["target", "-started_at"], name="idx_susp_target_started"),
            models.Index(fields=["target", "ended_at"], name="idx_susp_target_ended"),
            models.Index(fields=["until"], name="idx_susp_until"),
        ]

    @property
    def is_active(self) -> bool:
        now = timezone.now()

        if self.ended_at is not None:
            return False

        if self.until is None:
            return True

        return self.until > now
