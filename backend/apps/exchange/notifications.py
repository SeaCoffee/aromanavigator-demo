import logging

from apps.notifications.notifications_service import NotificationsService
from core.choises.exchange_status import ExchangeStatus


logger = logging.getLogger(__name__)


EXCHANGE_NOTIFICATION_CREATED = "exchange_created"
EXCHANGE_NOTIFICATION_ACCEPTED = "exchange_accepted"
EXCHANGE_NOTIFICATION_REJECTED = "exchange_rejected"
EXCHANGE_NOTIFICATION_CANCELED = "exchange_canceled"


def _wardrobe_title(item) -> str:
    fragrance = getattr(item, "fragrance", None)
    brand = getattr(getattr(fragrance, "brand", None), "name", "")
    name = getattr(fragrance, "name", "")
    return f"{brand} {name}".strip() or "РџРѕР·РёС†С–СЏ Р±С–Р»СЊС€Рµ РЅРµРґРѕСЃС‚СѓРїРЅР°"


def build_requested_payload(*, proposal, requested_obj=None) -> dict:
    requested = requested_obj or proposal.requested_obj

    payload = {
        "proposal_id": proposal.id,
        "status": proposal.status,
        "message": proposal.message,
        "decision_note": proposal.decision_note,
    }

    if requested is not None:
        fragrance = getattr(requested, "fragrance", None)
        brand = getattr(getattr(fragrance, "brand", None), "name", "")
        name = getattr(fragrance, "name", "")
        payload["requested"] = {
            "app": requested._meta.app_label,
            "model": requested._meta.model_name,
            "type": "wardrobe",
            "id": requested.pk,
            "fragrance_id": getattr(requested, "fragrance_id", None),
            "brand": brand,
            "name": name,
            "title": _wardrobe_title(requested),
            "subtitle": requested.get_status_display()
            if hasattr(requested, "get_status_display")
            else "",
        }
    else:
        payload["requested"] = {
            "app": proposal.requested_ct.app_label,
            "model": proposal.requested_ct.model,
            "type": "wardrobe",
            "id": proposal.requested_id,
        }

    return payload


def notify_exchange_created(*, proposal, requested_obj=None) -> None:
    try:
        NotificationsService.notify(
            user_id=proposal.owner_id,
            verb=EXCHANGE_NOTIFICATION_CREATED,
            actor_obj=proposal.proposer,
            target_obj=proposal,
            payload={
                "notification_kind": EXCHANGE_NOTIFICATION_CREATED,
                **build_requested_payload(
                    proposal=proposal,
                    requested_obj=requested_obj,
                ),
            },
            activity_event=None,
            inc_unread=True,
        )
    except Exception:
        logger.exception(
            "Failed to notify exchange created proposal_id=%s",
            proposal.id,
        )


def notify_exchange_status_changed(*, proposal, actor) -> None:
    verb_by_status = {
        ExchangeStatus.ACCEPTED: EXCHANGE_NOTIFICATION_ACCEPTED,
        ExchangeStatus.REJECTED: EXCHANGE_NOTIFICATION_REJECTED,
        ExchangeStatus.CANCELED: EXCHANGE_NOTIFICATION_CANCELED,
    }

    verb = verb_by_status.get(proposal.status)

    if not verb:
        return

    notify_user_id = (
        proposal.proposer_id
        if proposal.status in {ExchangeStatus.ACCEPTED, ExchangeStatus.REJECTED}
        else proposal.owner_id
    )

    try:
        NotificationsService.notify(
            user_id=notify_user_id,
            verb=verb,
            actor_obj=actor,
            target_obj=proposal,
            payload={
                "notification_kind": verb,
                **build_requested_payload(proposal=proposal),
            },
            activity_event=None,
            inc_unread=True,
        )
    except Exception:
        logger.exception(
            "Failed to notify exchange status changed proposal_id=%s status=%s",
            proposal.id,
            proposal.status,
        )
