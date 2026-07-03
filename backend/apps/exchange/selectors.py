from apps.exchange.models import ExchangeProposalModel
from apps.wardrobe.models import WardrobeItemModel
from apps.exchange.constants import (
    MAX_EXCHANGE_OFFERED_ITEMS,
    MAX_PENDING_SENT_EXCHANGES_PER_OWNER,
)
from core.choises.exchange_status import ExchangeStatus
from core.validators.exchange_validators import EXCHANGEABLE_WARDROBE_STATUSES


def exchange_visible_to_user_queryset(user):
    return (
        ExchangeProposalModel.objects
        .visible_to_user(user)
        .with_related()
        .newest_first()
    )


def sent_exchanges_for_user(user):
    return (
        ExchangeProposalModel.objects
        .sent_by(user)
        .with_related()
        .newest_first()
    )


def received_exchanges_for_user(user):
    return (
        ExchangeProposalModel.objects
        .received_by(user)
        .with_related()
        .newest_first()
    )


def pending_received_exchange_queryset(user):
    return (
        ExchangeProposalModel.objects
        .pending_received_by(user)
        .with_related()
    )


def pending_sent_exchange_queryset(user):
    return (
        ExchangeProposalModel.objects
        .pending_sent_by(user)
        .with_related()
    )


def _exchange_form_wardrobe_items_for_user(user):
    return (
        WardrobeItemModel.objects
        .filter(user=user, status__in=EXCHANGEABLE_WARDROBE_STATUSES)
        .select_related("fragrance", "fragrance__brand")
        .order_by("-updated_at")
    )


def exchange_form_items_for_user(user):
    return {
        "wardrobe": _exchange_form_wardrobe_items_for_user(user),
    }

def pending_sent_exchange_count_for_owner(
    *,
    proposer_id: int,
    owner_id: int,
) -> int:
    return ExchangeProposalModel.objects.filter(
        proposer_id=proposer_id,
        owner_id=owner_id,
        status=ExchangeStatus.PENDING,
    ).count()


def exchange_create_limits_for_owner(
    *,
    proposer_id: int,
    owner_id: int,
) -> dict:
    pending_count = pending_sent_exchange_count_for_owner(
        proposer_id=proposer_id,
        owner_id=owner_id,
    )

    remaining = MAX_PENDING_SENT_EXCHANGES_PER_OWNER - pending_count

    return {
        "max_pending_per_owner": MAX_PENDING_SENT_EXCHANGES_PER_OWNER,
        "pending_to_owner_count": pending_count,
        "remaining_pending_to_owner": max(remaining, 0),
        "max_offered_items": MAX_EXCHANGE_OFFERED_ITEMS,
    }
