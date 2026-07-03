import logging

from apps.activity.adapters import get_activity_service
from apps.exchange.models import ExchangeProposalModel
from core.choises.activity_choises import ActivityVerb
from core.choises.exchange_status import ExchangeStatus


logger = logging.getLogger(__name__)


def build_exchange_payload(proposal: ExchangeProposalModel) -> dict:
    return {
        "activity_kind": proposal.status
        if proposal.status != ExchangeStatus.PENDING
        else "exchange_created",
        "proposal": {
            "id": proposal.id,
            "status": proposal.status,
            "requested": {
                "app": proposal.requested_ct.app_label,
                "model": proposal.requested_ct.model,
                "id": proposal.requested_id,
            },
        },
    }


def publish_exchange_activity(*, proposal: ExchangeProposalModel, actor) -> None:
    verb_by_status = {
        ExchangeStatus.PENDING: ActivityVerb.EXCHANGE_CREATED.value,
        ExchangeStatus.ACCEPTED: ActivityVerb.EXCHANGE_ACCEPTED.value,
        ExchangeStatus.REJECTED: ActivityVerb.EXCHANGE_REJECTED.value,
    }

    verb = verb_by_status.get(proposal.status)

    if not verb:
        return

    notify_users = [
        user_id
        for user_id in {proposal.proposer_id, proposal.owner_id}
        if user_id != actor.id
    ]

    try:
        get_activity_service().publish(
            actor=actor,
            verb=verb,
            target_obj=proposal,
            payload=build_exchange_payload(proposal),
            is_private=True,
            notify_users=notify_users,
        )
    except Exception:
        logger.exception(
            "Failed to publish exchange activity proposal_id=%s status=%s",
            proposal.id,
            proposal.status,
        )
