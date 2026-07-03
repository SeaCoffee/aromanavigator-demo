# apps/exchange/managers.py

from django.db import models
from django.db.models import Q

from core.choises.exchange_status import ExchangeStatus


class ExchangeProposalQuerySet(models.QuerySet):
    def visible_to_user(self, user):
        return self.filter(Q(proposer=user) | Q(owner=user))

    def sent_by(self, user):
        return self.filter(proposer=user)

    def received_by(self, user):
        return self.filter(owner=user)

    def pending(self):
        return self.filter(status=ExchangeStatus.PENDING)

    def pending_sent_by(self, user):
        return self.sent_by(user).pending()

    def pending_received_by(self, user):
        return self.received_by(user).pending()

    def with_related(self):
        return self.select_related(
            "proposer",
            "proposer__profile",
            "owner",
            "owner__profile",
            "requested_ct",
        )

    def newest_first(self):
        return self.order_by("-created_at")


class ExchangeProposalManager(models.Manager.from_queryset(ExchangeProposalQuerySet)):
    pass
