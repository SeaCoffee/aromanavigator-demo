from __future__ import annotations

from django.db.models import Q, QuerySet

from apps.social.models import BlockModel
from apps.users.models import UserModel


def user_with_profile_stats_queryset() -> QuerySet[UserModel]:
    return UserModel.objects.select_related(
        "profile",
        "stats",
    )


def public_users_queryset(*, viewer=None) -> QuerySet[UserModel]:
    queryset = (
        UserModel.objects
        .filter(
            is_active=True,
            profile__isnull=False,
        )
        .select_related(
            "profile",
            "stats",
        )
    )

    if viewer is not None and getattr(viewer, "is_authenticated", False):
        hidden_ids = BlockModel.objects.filter(
            Q(blocker=viewer) | Q(blocked=viewer)
        ).values_list("blocker_id", "blocked_id")
        excluded_ids = {
            user_id
            for pair in hidden_ids
            for user_id in pair
            if user_id != viewer.id
        }

        if excluded_ids:
            queryset = queryset.exclude(id__in=excluded_ids)

    return queryset


def admin_users_queryset() -> QuerySet[UserModel]:
    return user_with_profile_stats_queryset().all()


def admin_action_user_queryset(*, actor: UserModel) -> QuerySet[UserModel]:
    return admin_users_queryset().exclude(id=actor.id)


def get_admin_user_by_lookup_value(*, lookup_value: str) -> UserModel | None:
    value = (lookup_value or "").strip()

    if not value:
        return None

    queryset = admin_users_queryset()

    if value.isdigit():
        return queryset.filter(pk=value).first()

    return queryset.filter(email__iexact=value).first()


def normalize_public_display_name(value: str) -> str:
    normalized = (value or "").strip()

    if normalized.startswith("@"):
        normalized = normalized[1:].lstrip()

    return normalized


def public_user_search_queryset(*, query: str = "", viewer=None) -> QuerySet[UserModel]:
    normalized_query = normalize_public_display_name(query)

    queryset = public_users_queryset(viewer=viewer)

    if normalized_query:
        queryset = queryset.filter(
            Q(profile__display_name__icontains=normalized_query)
            | Q(profile__name__icontains=normalized_query)
        )

    return queryset.order_by("profile__display_name")


def get_public_user_by_display_name(
    *,
    display_name: str,
    viewer=None,
) -> UserModel | None:
    normalized_display_name = normalize_public_display_name(display_name)

    if not normalized_display_name:
        return None

    queryset = public_users_queryset()

    if viewer is not None and getattr(viewer, "is_authenticated", False):
        queryset = queryset.exclude(
            blocks_out__blocked=viewer,
        )

    return queryset.filter(
        profile__display_name__iexact=normalized_display_name,
    ).first()
