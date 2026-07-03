import logging

from django.contrib.contenttypes.models import ContentType
from django.db.transaction import atomic
from rest_framework.exceptions import ValidationError

from apps.exchange.activity import publish_exchange_activity
from apps.exchange.models import ExchangeProposalModel
from apps.exchange.notifications import (
    notify_exchange_created,
    notify_exchange_status_changed,
)
from core.choises.exchange_status import ExchangeStatus
from core.validators.exchange_validators import (
    validate_accepted_items_for_proposer,
    validate_not_self,
    validate_offered_items,
    validate_pending_sent_exchange_limit,
    validate_requested_item,
    validate_requested_item_still_available,
)

logger = logging.getLogger(__name__)


class ExchangeService:
    @staticmethod
    @atomic
    def create(
        *,
        proposer,
        requested_type: str,
        requested_id: int,
        owner_id: int,
        offer_all: bool,
        offered_items: list[dict],
        message: str | None = "",
    ) -> ExchangeProposalModel:
        validate_not_self(proposer.id, owner_id)
        validate_pending_sent_exchange_limit(
            proposer_id=proposer.id,
            owner_id=owner_id,
        )

        requested_obj = validate_requested_item(
            owner_id=owner_id,
            item_type=requested_type,
            item_id=requested_id,
        )

        clean_offered_items = []

        if not offer_all:
            clean_offered_items = offered_items or []
            validate_offered_items(
                proposer_id=proposer.id,
                offered_items=clean_offered_items,
            )

        proposal = ExchangeProposalModel.objects.create(
            proposer=proposer,
            owner_id=owner_id,
            requested_ct=ContentType.objects.get_for_model(
                requested_obj,
                for_concrete_model=False,
            ),
            requested_id=requested_obj.id,
            offer_all=offer_all,
            offered_items=clean_offered_items,
            message=(message or "").strip(),
        )

        ExchangeService._after_created(proposal, requested_obj)

        return proposal

    @staticmethod
    @atomic
    def accept(
        *,
        owner,
        proposal: ExchangeProposalModel,
        accepted_items: list[dict],
        decision_note: str | None = "",
    ) -> ExchangeProposalModel:
        ExchangeService._validate_owner_can_decide(owner, proposal)

        validate_requested_item_still_available(proposal)

        validate_accepted_items_for_proposer(
            proposer_id=proposal.proposer_id,
            offer_all=proposal.offer_all,
            offered_items=proposal.offered_items or [],
            accepted_items=accepted_items or [],
        )

        proposal.status = ExchangeStatus.ACCEPTED
        proposal.accepted_items = accepted_items or []
        proposal.decision_note = (decision_note or "").strip()
        proposal.save(
            update_fields=[
                "status",
                "accepted_items",
                "decision_note",
                "updated_at",
            ]
        )

        ExchangeService._after_status_changed(proposal, actor=owner)

        return proposal

    @staticmethod
    @atomic
    def reject(
        *,
        owner,
        proposal: ExchangeProposalModel,
        decision_note: str | None = "",
    ) -> ExchangeProposalModel:
        ExchangeService._validate_owner_can_decide(owner, proposal)

        proposal.status = ExchangeStatus.REJECTED
        proposal.decision_note = (decision_note or "").strip()
        proposal.save(
            update_fields=[
                "status",
                "decision_note",
                "updated_at",
            ]
        )

        ExchangeService._after_status_changed(proposal, actor=owner)

        return proposal

    @staticmethod
    @atomic
    def cancel(
        *,
        proposer,
        proposal: ExchangeProposalModel,
        decision_note: str | None = "",
    ) -> ExchangeProposalModel:
        if proposal.proposer_id != proposer.id:
            raise ValidationError("РўС–Р»СЊРєРё Р°РІС‚РѕСЂ РїСЂРѕРїРѕР·РёС†С–С— РјРѕР¶Рµ С—С— СЃРєР°СЃСѓРІР°С‚Рё.")

        if proposal.status != ExchangeStatus.PENDING:
            raise ValidationError("РњРѕР¶РЅР° СЃРєР°СЃСѓРІР°С‚Рё С‚С–Р»СЊРєРё РїСЂРѕРїРѕР·РёС†С–СЋ РІ СЃС‚Р°С‚СѓСЃС– pending.")

        proposal.status = ExchangeStatus.CANCELED
        proposal.decision_note = (decision_note or "").strip()
        proposal.save(
            update_fields=[
                "status",
                "decision_note",
                "updated_at",
            ]
        )

        ExchangeService._after_status_changed(proposal, actor=proposer)

        return proposal

    @staticmethod
    def _validate_owner_can_decide(owner, proposal: ExchangeProposalModel) -> None:
        if proposal.owner_id != owner.id:
            raise ValidationError("РўС–Р»СЊРєРё РІР»Р°СЃРЅРёРє РјРѕР¶Рµ РїСЂРёР№РЅСЏС‚Рё Р°Р±Рѕ РІС–РґС…РёР»РёС‚Рё РїСЂРѕРїРѕР·РёС†С–СЋ.")

        if proposal.status != ExchangeStatus.PENDING:
            raise ValidationError("РџСЂРѕРїРѕР·РёС†С–СЋ РІР¶Рµ РѕРїСЂР°С†СЊРѕРІР°РЅРѕ.")

    @staticmethod
    def _after_created(proposal: ExchangeProposalModel, requested_obj) -> None:
        notify_exchange_created(
            proposal=proposal,
            requested_obj=requested_obj,
        )
        publish_exchange_activity(proposal=proposal, actor=proposal.proposer)

    @staticmethod
    def _after_status_changed(proposal: ExchangeProposalModel, actor) -> None:
        notify_exchange_status_changed(
            proposal=proposal,
            actor=actor,
        )
        publish_exchange_activity(proposal=proposal, actor=actor)
