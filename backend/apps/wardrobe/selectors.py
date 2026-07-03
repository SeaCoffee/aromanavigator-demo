from django.db.models import Prefetch, QuerySet
from django.shortcuts import get_object_or_404

from apps.fragrance.models import FragranceNoteOfficialModel
from apps.users.models import UserModel
from apps.wardrobe.models import WardrobeItemModel
from core.validators.profile_validators import display_name_ci


def wardrobe_items_base_queryset() -> QuerySet[WardrobeItemModel]:
    official_notes_qs = (
        FragranceNoteOfficialModel.objects
        .select_related("note")
        .order_by("level", "position", "id")
    )

    return (
        WardrobeItemModel.objects
        .select_related(
            "user",
            "user__profile",
            "fragrance",
            "fragrance__brand",
        )
        .prefetch_related(
            "fragrance__families",
            "fragrance__perfumers",
            Prefetch(
                "fragrance__official_note_links",
                queryset=official_notes_qs,
            ),
        )
    )


def wardrobe_for_user(user) -> QuerySet[WardrobeItemModel]:
    return wardrobe_items_base_queryset().filter(user=user)


def wardrobe_item_for_owner(
    *,
    user,
    item_id: int,
) -> WardrobeItemModel | None:
    return (
        wardrobe_items_base_queryset()
        .filter(
            id=item_id,
            user=user,
        )
        .first()
    )


def public_wardrobe_for_owner(
    *,
    owner: UserModel,
    viewer,
) -> QuerySet[WardrobeItemModel]:
    qs = wardrobe_items_base_queryset().filter(user=owner)

    viewer_is_owner = (
        getattr(viewer, "is_authenticated", False)
        and getattr(viewer, "id", None) == owner.id
    )

    if not viewer_is_owner:
        qs = qs.filter(is_private=False)

    return qs


def public_wardrobe_for_user_id(
    *,
    user_id: int,
    viewer,
) -> QuerySet[WardrobeItemModel]:
    owner = get_object_or_404(
        UserModel.objects.select_related("profile"),
        id=user_id,
        is_active=True,
    )

    return public_wardrobe_for_owner(
        owner=owner,
        viewer=viewer,
    )


def public_wardrobe_for_display_name(
    *,
    display_name: str,
    viewer,
) -> QuerySet[WardrobeItemModel]:
    normalized_display_name = display_name_ci(display_name)

    owner = get_object_or_404(
        UserModel.objects.select_related("profile"),
        profile__display_name_ci=normalized_display_name,
        is_active=True,
    )

    return public_wardrobe_for_owner(
        owner=owner,
        viewer=viewer,
    )
