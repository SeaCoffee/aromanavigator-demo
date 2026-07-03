from __future__ import annotations

from apps.exchange.selectors import (
    exchange_create_limits_for_owner,
    exchange_form_items_for_user,
)
from core.validators.exchange_validators import (
    validate_not_self,
    validate_requested_item,
)


class ExchangeCreateFormService:
    @staticmethod
    def get_data(
        *,
        user,
        requested_type: str,
        requested_id: int,
        owner_id: int,
    ) -> dict:
        validate_not_self(user.id, owner_id)

        requested = validate_requested_item(
            owner_id=owner_id,
            item_type=requested_type,
            item_id=requested_id,
        )

        items = exchange_form_items_for_user(user)

        return {
            "requested": requested,
            "items": items,
            "limits": exchange_create_limits_for_owner(
                proposer_id=user.id,
                owner_id=owner_id,
            ),
        }
