from rest_framework import serializers

from apps.exchange.constants import EXCHANGE_ITEM_TYPES
from apps.exchange.exchange_service import ExchangeService
from apps.exchange.models import ExchangeProposalModel
from apps.users.author_display import is_deleted_user, personal_user_avatar, personal_user_display_name
from apps.wardrobe.models import WardrobeItemModel
from core.validators.exchange_validators import MODEL_BY_TYPE


UNAVAILABLE_EXCHANGE_ITEM_TITLE = "РџРѕР·РёС†С–СЏ Р±С–Р»СЊС€Рµ РЅРµРґРѕСЃС‚СѓРїРЅР°"


def wardrobe_item_brand(obj: WardrobeItemModel) -> str:
    brand = getattr(getattr(obj, "fragrance", None), "brand", None)
    return getattr(brand, "name", "") or ""


def wardrobe_item_name(obj: WardrobeItemModel) -> str:
    return getattr(getattr(obj, "fragrance", None), "name", "") or ""


def wardrobe_item_title(obj: WardrobeItemModel) -> str:
    return f"{wardrobe_item_brand(obj)} {wardrobe_item_name(obj)}".strip()


def wardrobe_item_subtitle(obj: WardrobeItemModel) -> str:
    return obj.get_status_display() if hasattr(obj, "get_status_display") else ""


def exchange_item_payload(*, item_type: str, item_id: int, owner_id: int | None = None) -> dict:
    model_class = MODEL_BY_TYPE.get(item_type)
    obj = None

    if model_class is not None:
        queryset = model_class.objects.filter(pk=item_id)
        if owner_id is not None:
            queryset = queryset.filter(user_id=owner_id)
        obj = queryset.select_related("fragrance", "fragrance__brand").first()

    payload = {"type": item_type, "id": item_id}

    if obj is None:
        payload["title"] = UNAVAILABLE_EXCHANGE_ITEM_TITLE
        return payload

    brand = wardrobe_item_brand(obj)
    name = wardrobe_item_name(obj)
    payload.update(
        {
            "brand": brand,
            "name": name,
            "fragrance_id": getattr(obj, "fragrance_id", None),
            "title": wardrobe_item_title(obj) or UNAVAILABLE_EXCHANGE_ITEM_TITLE,
            "subtitle": wardrobe_item_subtitle(obj),
        }
    )
    return payload


class ExchangeItemSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=EXCHANGE_ITEM_TYPES)
    id = serializers.IntegerField(min_value=1)
    note = serializers.CharField(required=False, allow_blank=True)


class ExchangeCreateSerializer(serializers.Serializer):
    requested_type = serializers.ChoiceField(choices=EXCHANGE_ITEM_TYPES)
    requested_id = serializers.IntegerField(min_value=1)
    owner_id = serializers.IntegerField(min_value=1)
    offer_all = serializers.BooleanField(default=False)
    offered_items = ExchangeItemSerializer(many=True, required=False)
    message = serializers.CharField(allow_blank=True, required=False)

    def create(self, validated_data):
        return ExchangeService.create(
            proposer=self.context["request"].user,
            requested_type=validated_data["requested_type"],
            requested_id=validated_data["requested_id"],
            owner_id=validated_data["owner_id"],
            offer_all=validated_data.get("offer_all", False),
            offered_items=validated_data.get("offered_items", []),
            message=validated_data.get("message", ""),
        )


class ExchangeAcceptSerializer(serializers.Serializer):
    accepted_items = ExchangeItemSerializer(many=True)
    decision_note = serializers.CharField(allow_blank=True, required=False)


class ExchangeRejectSerializer(serializers.Serializer):
    decision_note = serializers.CharField(allow_blank=True, required=False)


class ExchangeCancelSerializer(serializers.Serializer):
    decision_note = serializers.CharField(allow_blank=True, required=False)


class ExchangeUserSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    def get_id(self, obj):
        return None if is_deleted_user(obj) else obj.pk

    def get_display_name(self, obj):
        return personal_user_display_name(obj) or "РљРѕСЂРёСЃС‚СѓРІР°С‡"

    def get_avatar_url(self, obj):
        return personal_user_avatar(obj)


class ExchangeProposalSerializer(serializers.ModelSerializer):
    proposer = ExchangeUserSerializer(read_only=True)
    owner = ExchangeUserSerializer(read_only=True)
    requested = serializers.SerializerMethodField()
    offered_items = serializers.SerializerMethodField()
    accepted_items = serializers.SerializerMethodField()

    class Meta:
        model = ExchangeProposalModel
        fields = [
            "id",
            "proposer",
            "owner",
            "status",
            "message",
            "requested",
            "offer_all",
            "offered_items",
            "accepted_items",
            "decision_note",
            "created_at",
            "updated_at",
        ]

    def get_requested(self, obj):
        requested_obj = obj.requested_obj

        if requested_obj is not None:
            payload = exchange_item_payload(
                item_type="wardrobe",
                item_id=requested_obj.pk,
            )
            payload["owner_id"] = self._public_owner_id(obj)
            return payload

        return {
            "type": "wardrobe",
            "id": obj.requested_id,
            "owner_id": self._public_owner_id(obj),
            "title": UNAVAILABLE_EXCHANGE_ITEM_TITLE,
        }

    def _public_owner_id(self, obj):
        return obj.owner_id

    def _display_items(self, obj, items, owner_id):
        result = []
        for item in items or []:
            payload = exchange_item_payload(
                item_type=item.get("type", ""),
                item_id=item.get("id", 0),
                owner_id=owner_id,
            )
            note = (item.get("note") or "").strip()
            if note:
                payload["note"] = note
            result.append(payload)
        return result

    def get_offered_items(self, obj):
        return self._display_items(obj, obj.offered_items, obj.proposer_id)

    def get_accepted_items(self, obj):
        return self._display_items(obj, obj.accepted_items, obj.proposer_id)


class ExchangeFormItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    type = serializers.SerializerMethodField()
    fragrance_id = serializers.IntegerField(required=False)
    brand = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    subtitle = serializers.SerializerMethodField()
    is_exchange_possible = serializers.SerializerMethodField()

    def get_type(self, obj):
        return "wardrobe"

    def get_brand(self, obj):
        return wardrobe_item_brand(obj)

    def get_name(self, obj):
        return wardrobe_item_name(obj)

    def get_title(self, obj):
        return wardrobe_item_title(obj)

    def get_subtitle(self, obj):
        return wardrobe_item_subtitle(obj)

    def get_is_exchange_possible(self, obj):
        return True


class ExchangeCreateFormQuerySerializer(serializers.Serializer):
    requested_type = serializers.ChoiceField(choices=EXCHANGE_ITEM_TYPES)
    requested_id = serializers.IntegerField(min_value=1)
    owner_id = serializers.IntegerField(min_value=1)


class ExchangeCreateLimitsSerializer(serializers.Serializer):
    max_pending_per_owner = serializers.IntegerField()
    pending_to_owner_count = serializers.IntegerField()
    remaining_pending_to_owner = serializers.IntegerField()
    max_offered_items = serializers.IntegerField()


class ExchangeCreateFormItemsSerializer(serializers.Serializer):
    wardrobe = ExchangeFormItemSerializer(many=True)


class ExchangeCreateFormResponseSerializer(serializers.Serializer):
    requested = ExchangeFormItemSerializer()
    items = ExchangeCreateFormItemsSerializer()
    limits = ExchangeCreateLimitsSerializer()
