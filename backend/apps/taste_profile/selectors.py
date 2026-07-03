from django.db.models import Prefetch, QuerySet
from django.shortcuts import get_object_or_404

from apps.users.models import UserModel
from core.validators.profile_validators import display_name_ci

from apps.taste_profile.models import (
    TasteBrandPreferenceModel,
    TasteConcentrationPreferenceModel,
    TasteFamilyPreferenceModel,
    TasteFragranceMarkModel,
    TasteNotePreferenceModel,
    TastePerfumerPreferenceModel,
    TasteProfileModel,
    TasteSeasonPreferenceModel,
)


def taste_profile_base_queryset() -> QuerySet[TasteProfileModel]:
    return (
        TasteProfileModel.objects
        .select_related("user", "user__profile")
        .prefetch_related(
            Prefetch(
                "family_preferences",
                queryset=(
                    TasteFamilyPreferenceModel.objects
                    .select_related("family")
                    .order_by("attitude", "family__name", "id")
                ),
            ),
            Prefetch(
                "note_preferences",
                queryset=(
                    TasteNotePreferenceModel.objects
                    .select_related("note")
                    .order_by("attitude", "note__name", "id")
                ),
            ),
            Prefetch(
                "perfumer_preferences",
                queryset=(
                    TastePerfumerPreferenceModel.objects
                    .select_related("perfumer")
                    .order_by("attitude", "perfumer__name", "id")
                ),
            ),
            Prefetch(
                "brand_preferences",
                queryset=(
                    TasteBrandPreferenceModel.objects
                    .select_related("brand")
                    .order_by("attitude", "brand__name", "id")
                ),
            ),
            Prefetch(
                "season_preferences",
                queryset=(
                    TasteSeasonPreferenceModel.objects
                    .order_by("attitude", "season", "id")
                ),
            ),
            Prefetch(
                "concentration_preferences",
                queryset=(
                    TasteConcentrationPreferenceModel.objects
                    .order_by("attitude", "concentration", "id")
                ),
            ),
            Prefetch(
                "fragrance_marks",
                queryset=(
                    TasteFragranceMarkModel.objects
                    .select_related("fragrance", "fragrance__brand")
                    .order_by("mark", "-updated_at", "id")
                ),
            ),
        )
    )


def taste_profile_for_user(user) -> TasteProfileModel | None:
    return taste_profile_base_queryset().filter(user=user).first()


def viewer_is_owner(*, viewer, owner: UserModel) -> bool:
    return (
        getattr(viewer, "is_authenticated", False)
        and getattr(viewer, "id", None) == owner.id
    )


def public_taste_profile_for_owner(
    *,
    owner: UserModel,
    viewer,
) -> TasteProfileModel | None:
    qs = taste_profile_base_queryset().filter(user=owner)

    if not viewer_is_owner(viewer=viewer, owner=owner):
        qs = qs.filter(is_public=True)

    return qs.first()


def public_taste_profile_for_user_id(
    *,
    user_id: int,
    viewer,
) -> TasteProfileModel | None:
    owner = get_object_or_404(
        UserModel.objects.select_related("profile"),
        id=user_id,
        is_active=True,
    )

    return public_taste_profile_for_owner(
        owner=owner,
        viewer=viewer,
    )


def public_taste_profile_for_display_name(
    *,
    display_name: str,
    viewer,
) -> TasteProfileModel | None:
    normalized_display_name = display_name_ci(display_name)

    owner = get_object_or_404(
        UserModel.objects.select_related("profile"),
        profile__display_name_ci=normalized_display_name,
        is_active=True,
    )

    return public_taste_profile_for_owner(
        owner=owner,
        viewer=viewer,
    )


def family_preferences_for_user(user) -> QuerySet[TasteFamilyPreferenceModel]:
    return (
        TasteFamilyPreferenceModel.objects
        .select_related("profile", "family")
        .filter(profile__user=user)
    )


def note_preferences_for_user(user) -> QuerySet[TasteNotePreferenceModel]:
    return (
        TasteNotePreferenceModel.objects
        .select_related("profile", "note")
        .filter(profile__user=user)
    )


def perfumer_preferences_for_user(user) -> QuerySet[TastePerfumerPreferenceModel]:
    return (
        TastePerfumerPreferenceModel.objects
        .select_related("profile", "perfumer")
        .filter(profile__user=user)
    )


def brand_preferences_for_user(user) -> QuerySet[TasteBrandPreferenceModel]:
    return (
        TasteBrandPreferenceModel.objects
        .select_related("profile", "brand")
        .filter(profile__user=user)
    )


def season_preferences_for_user(user) -> QuerySet[TasteSeasonPreferenceModel]:
    return (
        TasteSeasonPreferenceModel.objects
        .select_related("profile")
        .filter(profile__user=user)
    )


def concentration_preferences_for_user(user) -> QuerySet[TasteConcentrationPreferenceModel]:
    return (
        TasteConcentrationPreferenceModel.objects
        .select_related("profile")
        .filter(profile__user=user)
    )


def fragrance_marks_for_user(user) -> QuerySet[TasteFragranceMarkModel]:
    return (
        TasteFragranceMarkModel.objects
        .select_related("profile", "fragrance", "fragrance__brand")
        .filter(profile__user=user)
    )
