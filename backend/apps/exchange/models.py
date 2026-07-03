from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from apps.exchange.managers import ExchangeProposalManager
from core.choises.exchange_status import ExchangeStatus
from core.models import BaseModel


class ExchangeProposalModel(BaseModel):
    proposer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="exchange_proposals_sent",
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="exchange_proposals_received",
    )

    requested_ct = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    requested_id = models.PositiveIntegerField()
    requested_obj = GenericForeignKey("requested_ct", "requested_id")

    offer_all = models.BooleanField(default=False)
    offered_items = models.JSONField(default=list, blank=True)

    message = models.TextField(blank=True)

    accepted_items = models.JSONField(default=list, blank=True)
    decision_note = models.TextField(blank=True)

    status = models.CharField(
        max_length=16,
        choices=ExchangeStatus.choices,
        default=ExchangeStatus.PENDING,
    )

    objects = ExchangeProposalManager()

    class Meta:
        db_table = "exchange_proposal"
        indexes = [
            models.Index(fields=["owner", "status", "created_at"], name="idx_exch_owner_status"),
            models.Index(fields=["proposer", "status", "created_at"], name="idx_exch_prop_status"),
            models.Index(fields=["requested_ct", "requested_id"], name="idx_exch_req_gfk"),
            models.Index(fields=["status", "created_at"], name="idx_exch_status_created"),
        ]

    def __str__(self) -> str:
        return f"Exchange({self.pk}) {self.proposer_id} в†’ {self.owner_id} [{self.status}]"
