import logging

from apps.activity.adapters import get_activity_service
from apps.wardrobe.models import WardrobeItemModel
from core.choises.activity_choises import ActivityVerb


logger = logging.getLogger(__name__)


def build_wardrobe_payload(item: WardrobeItemModel) -> dict:
    fragrance = item.fragrance
    brand = fragrance.brand

    return {
        "item": {
            "app": item._meta.app_label,
            "model": item._meta.model_name,
            "id": item.id,
            "fragrance": {
                "id": fragrance.id,
                "name": fragrance.name,
                "slug": fragrance.slug,
                "release_year": fragrance.release_year,
                "brand": {
                    "id": brand.id,
                    "name": brand.name,
                    "slug": brand.slug,
                    "country": brand.country,
                },
                "display_name": f"{brand.name} вЂ” {fragrance.name}",
            },
            "status": item.status,
            "status_label": item.get_status_display(),
            "rating": item.rating,
        }
    }


def publish_wardrobe_created_activity(*, item: WardrobeItemModel) -> None:
    if item.is_private:
        return

    try:
        get_activity_service().publish(
            actor=item.user,
            verb=ActivityVerb.WARDROBE_ITEM_ADDED.value,
            target_obj=item,
            payload={
                "activity_kind": "wardrobe_item_created",
                **build_wardrobe_payload(item),
            },
            is_private=False,
            notify_users=None,
        )
    except Exception:
        logger.exception(
            "Failed to publish wardrobe created activity item_id=%s",
            item.id,
        )


def publish_wardrobe_updated_activity(*, item: WardrobeItemModel) -> None:
    if item.is_private:
        return

    try:
        get_activity_service().publish(
            actor=item.user,
            verb=ActivityVerb.WARDROBE_ITEM_ADDED.value,
            target_obj=item,
            payload={
                "activity_kind": "wardrobe_item_updated",
                **build_wardrobe_payload(item),
            },
            is_private=False,
            notify_users=None,
        )
    except Exception:
        logger.exception(
            "Failed to publish wardrobe updated activity item_id=%s",
            item.id,
        )
