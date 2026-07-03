from __future__ import annotations

from typing import Sequence, TypedDict

from rest_framework.exceptions import ValidationError

from apps.exchange.constants import EXCHANGE_ITEM_TYPES
from apps.wardrobe.models import WardrobeItemModel
from core.choises.exchange_status import ExchangeStatus
from core.choises.wardrobe_status_choise import WardrobeStatus


MAX_PENDING_SENT_EXCHANGES_PER_OWNER = 3
MAX_EXCHANGE_OFFERED_ITEMS = 10
EXCHANGEABLE_WARDROBE_STATUSES = (
    WardrobeStatus.OWN,
    WardrobeStatus.SAMPLE,
)


class ExchangeItem(TypedDict, total=False):
    type: str
    id: int
    note: str


MODEL_BY_TYPE = {
    "wardrobe": WardrobeItemModel,
}


def validate_not_self(proposer_id: int, owner_id: int) -> None:
    if proposer_id == owner_id:
        raise ValidationError("РќРµ РјРѕР¶РЅР° РїСЂРѕРїРѕРЅСѓРІР°С‚Рё РѕР±РјС–РЅ СЃР°РјРѕРјСѓ СЃРѕР±С–.")


def validate_pending_sent_exchange_limit(
    *,
    proposer_id: int,
    owner_id: int,
) -> None:
    from apps.exchange.models import ExchangeProposalModel

    pending_count = ExchangeProposalModel.objects.filter(
        proposer_id=proposer_id,
        owner_id=owner_id,
        status=ExchangeStatus.PENDING,
    ).count()

    if pending_count >= MAX_PENDING_SENT_EXCHANGES_PER_OWNER:
        raise ValidationError(
            f"РЈ РІР°СЃ СѓР¶Рµ С” {MAX_PENDING_SENT_EXCHANGES_PER_OWNER} РЅРµРѕР±СЂРѕР±Р»РµРЅС– "
            "РїСЂРѕРїРѕР·РёС†С–С— РѕР±РјС–РЅСѓ С†СЊРѕРјСѓ РєРѕСЂРёСЃС‚СѓРІР°С‡РµРІС–. Р”РѕС‡РµРєР°Р№С‚РµСЃСЏ РІС–РґРїРѕРІС–РґС– "
            "Р°Р±Рѕ СЃРєР°СЃСѓР№С‚Рµ РѕРґРЅСѓ Р· РЅРёС…."
        )


def validate_offered_items_count(offered_items: Sequence[ExchangeItem]) -> None:
    if len(offered_items) > MAX_EXCHANGE_OFFERED_ITEMS:
        raise ValidationError(
            f"Р’ РѕРґРЅС–Р№ РїСЂРѕРїРѕР·РёС†С–С— РјРѕР¶РЅР° РѕР±СЂР°С‚Рё РјР°РєСЃРёРјСѓРј {MAX_EXCHANGE_OFFERED_ITEMS} РїРѕР·РёС†С–Р№."
        )


def content_type_to_exchange_type(*, proposal) -> str:
    requested_obj = proposal.requested_obj

    if isinstance(requested_obj, WardrobeItemModel):
        return "wardrobe"

    if proposal.requested_ct.model == "wardrobeitemmodel":
        return "wardrobe"

    raise ValidationError("РќРµРєРѕСЂРµРєС‚РЅРёР№ С‚РёРї РїРѕР·РёС†С–С— РѕР±РјС–РЅСѓ.")


def _base_queryset_for_type(owner_id: int, item_type: str, *, require_public: bool):
    if item_type not in MODEL_BY_TYPE:
        raise ValidationError("РќРµРєРѕСЂРµРєС‚РЅРёР№ С‚РёРї РїРѕР·РёС†С–С— РґР»СЏ РѕР±РјС–РЅСѓ.")

    queryset = WardrobeItemModel.objects.filter(
        user_id=owner_id,
        status__in=EXCHANGEABLE_WARDROBE_STATUSES,
    )

    if require_public:
        queryset = queryset.filter(is_private=False)

    return queryset.select_related("fragrance", "fragrance__brand")


def validate_exchange_item_for_owner(
    *,
    owner_id: int,
    item_type: str,
    item_id: int,
    require_public: bool = True,
):
    obj = _base_queryset_for_type(
        owner_id=owner_id,
        item_type=item_type,
        require_public=require_public,
    ).filter(id=item_id).first()

    if not obj:
        raise ValidationError(
            "РџРѕР·РёС†С–СЋ РЅРµ Р·РЅР°Р№РґРµРЅРѕ Р°Р±Рѕ РІРѕРЅР° РЅРµРґРѕСЃС‚СѓРїРЅР° РґР»СЏ РѕР±РјС–РЅСѓ."
        )

    return obj


def validate_requested_item(owner_id: int, item_type: str, item_id: int):
    return validate_exchange_item_for_owner(
        owner_id=owner_id,
        item_type=item_type,
        item_id=item_id,
        require_public=True,
    )


def validate_requested_item_still_available(proposal) -> None:
    item_type = content_type_to_exchange_type(proposal=proposal)

    validate_requested_item(
        owner_id=proposal.owner_id,
        item_type=item_type,
        item_id=proposal.requested_id,
    )


def validate_offered_items(
    proposer_id: int,
    offered_items: Sequence[ExchangeItem],
) -> None:
    if not offered_items:
        raise ValidationError(
            "РћР±РµСЂС–С‚СЊ РїРѕР·РёС†С–С— РґР»СЏ РѕР±РјС–РЅСѓ Р°Р±Рѕ Р·Р°РїСЂРѕРїРѕРЅСѓР№С‚Рµ РІСЃС– РґРѕСЃС‚СѓРїРЅС– РїРѕР·РёС†С–С—."
        )

    validate_offered_items_count(offered_items)

    seen: set[tuple[str, int]] = set()

    for index, item in enumerate(offered_items):
        item_type = item.get("type")
        item_id = item.get("id")

        if item_type not in EXCHANGE_ITEM_TYPES or type(item_id) is not int:
            raise ValidationError(f"РџРѕР·РёС†С–СЏ #{index + 1} РЅРµРєРѕСЂРµРєС‚РЅР°.")

        pair = (item_type, item_id)

        if pair in seen:
            raise ValidationError(f"РџРѕР·РёС†С–СЏ #{index + 1} РґСѓР±Р»СЋС”С‚СЊСЃСЏ.")

        seen.add(pair)

        validate_exchange_item_for_owner(
            owner_id=proposer_id,
            item_type=item_type,
            item_id=item_id,
            require_public=False,
        )


def validate_accepted_items_for_proposer(
    *,
    proposer_id: int,
    offer_all: bool,
    offered_items: Sequence[ExchangeItem],
    accepted_items: Sequence[ExchangeItem],
) -> None:
    if not accepted_items:
        raise ValidationError("РћР±РµСЂС–С‚СЊ, С‰Рѕ СЃР°РјРµ РїСЂРёР№РјР°С”С‚Рµ РІ РѕР±РјС–РЅ.")

    if not offer_all:
        offered_pairs = {
            (item.get("type"), item.get("id"))
            for item in offered_items
        }

        for index, item in enumerate(accepted_items):
            pair = (item.get("type"), item.get("id"))

            if pair not in offered_pairs:
                raise ValidationError(
                    f"РџРѕР·РёС†С–СЏ #{index + 1} РІС–РґСЃСѓС‚РЅСЏ Сѓ РїСЂРѕРїРѕР·РёС†С–С—."
                )

    validate_offered_items(
        proposer_id=proposer_id,
        offered_items=accepted_items,
    )
