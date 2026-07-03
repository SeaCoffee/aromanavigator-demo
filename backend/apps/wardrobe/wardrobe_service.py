# apps/wardrobe/wardrobe_service.py

from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.db.transaction import atomic

from apps.fragrance.models import FragranceModel
from apps.wardrobe.activity import (
    publish_wardrobe_created_activity,
    publish_wardrobe_updated_activity,
)
from apps.wardrobe.models import WardrobeItemModel
from apps.wardrobe.selectors import wardrobe_item_for_owner
from core.choises.wardrobe_status_choise import WardrobeStatus


class WardrobeError(Exception):
    pass


ACTIVITY_RELEVANT_UPDATE_FIELDS = {
    "fragrance",
    "fragrance_id",
    "status",
    "rating",
}


def get_fragrance_or_error(fragrance_id: int) -> FragranceModel:
    fragrance = (
        FragranceModel.objects
        .select_related("brand")
        .filter(id=fragrance_id)
        .first()
    )

    if fragrance is None:
        raise WardrobeError("РђСЂРѕРјР°С‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.")

    return fragrance


class WardrobeService:
    @staticmethod
    @atomic
    def add_item(
        user,
        *,
        fragrance_id: int,
        status: str = WardrobeStatus.OWN,
        rating=None,
        notes: str = "",
        is_private: bool = False,
    ) -> WardrobeItemModel:
        clean_notes = (notes or "").strip()
        fragrance = get_fragrance_or_error(fragrance_id)

        try:
            item, created = WardrobeItemModel.objects.get_or_create(
                user=user,
                fragrance=fragrance,
                status=status,
                defaults={
                    "rating": rating,
                    "notes": clean_notes,
                    "is_private": bool(is_private),
                },
            )
        except (ValidationError, IntegrityError) as exc:
            raise WardrobeError(str(exc))

        if created:
            item = (
                WardrobeItemModel.objects
                .select_related("fragrance", "fragrance__brand")
                .get(id=item.id)
            )

            if not item.is_private:
                publish_wardrobe_created_activity(item=item)

            return item

        old_is_private = item.is_private
        changed_fields = []

        if item.rating != rating:
            item.rating = rating
            changed_fields.append("rating")

        if item.notes != clean_notes:
            item.notes = clean_notes
            changed_fields.append("notes")

        if item.is_private != bool(is_private):
            item.is_private = bool(is_private)
            changed_fields.append("is_private")

        if changed_fields:
            changed_fields.append("updated_at")
            item.save(update_fields=changed_fields)

            item = (
                WardrobeItemModel.objects
                .select_related("fragrance", "fragrance__brand")
                .get(id=item.id)
            )

            if old_is_private and not item.is_private:
                publish_wardrobe_created_activity(item=item)
            elif (
                not item.is_private
                and ACTIVITY_RELEVANT_UPDATE_FIELDS.intersection(changed_fields)
            ):
                publish_wardrobe_updated_activity(item=item)

        return item

    @staticmethod
    @atomic
    def update_item(user, item_id: int, *, data: dict) -> WardrobeItemModel:
        item = wardrobe_item_for_owner(user=user, item_id=item_id)

        if item is None:
            raise WardrobeError("Р•Р»РµРјРµРЅС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.")

        old_is_private = item.is_private
        changed_fields = []

        if "fragrance_id" in data and item.fragrance_id != data["fragrance_id"]:
            fragrance = get_fragrance_or_error(data["fragrance_id"])
            item.fragrance = fragrance
            changed_fields.append("fragrance")

        for field in ("status", "rating", "is_private"):
            if field in data and getattr(item, field) != data[field]:
                setattr(item, field, data[field])
                changed_fields.append(field)

        if "notes" in data:
            clean_notes = (data.get("notes") or "").strip()

            if item.notes != clean_notes:
                item.notes = clean_notes
                changed_fields.append("notes")

        if not changed_fields:
            return item

        try:
            item.save(update_fields=[*changed_fields, "updated_at"])
        except IntegrityError:
            raise WardrobeError("РўР°РєРёР№ Р°СЂРѕРјР°С‚ СѓР¶Рµ С” Сѓ С†СЊРѕРјСѓ СЃС‚Р°С‚СѓСЃС–.")
        except ValidationError as exc:
            raise WardrobeError(str(exc))

        item = (
            WardrobeItemModel.objects
            .select_related("fragrance", "fragrance__brand")
            .get(id=item.id)
        )

        if old_is_private and not item.is_private:
            publish_wardrobe_created_activity(item=item)
        elif (
            not item.is_private
            and ACTIVITY_RELEVANT_UPDATE_FIELDS.intersection(changed_fields)
        ):
            publish_wardrobe_updated_activity(item=item)

        return item

    @staticmethod
    @atomic
    def delete_item(user, item_id: int) -> int:
        deleted, _ = WardrobeItemModel.objects.filter(
            id=item_id,
            user=user,
        ).delete()

        return deleted

    @staticmethod
    def get_item(user, item_id: int) -> WardrobeItemModel:
        item = wardrobe_item_for_owner(user=user, item_id=item_id)

        if item is None:
            raise WardrobeError("Р•Р»РµРјРµРЅС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.")

        return item
