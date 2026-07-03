from rest_framework import serializers

from apps.fragrance.models import FragranceModel
from apps.fragrance.serializers import FragranceListSerializer
from apps.wardrobe.models import WardrobeItemModel
from core.choises.wardrobe_status_choise import WardrobeStatus
from core.validators.wardrobe_validators import validate_rating_1_10


class WardrobeItemSerializer(serializers.ModelSerializer):
    fragrance_id = serializers.IntegerField(read_only=True)
    fragrance = FragranceListSerializer(read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = WardrobeItemModel
        fields = (
            "id",
            "fragrance_id",
            "fragrance",
            "status",
            "status_label",
            "rating",
            "notes",
            "is_private",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class WardrobeItemCreateSerializer(serializers.Serializer):
    fragrance_id = serializers.IntegerField(min_value=1)

    status = serializers.ChoiceField(
        choices=WardrobeStatus.choices,
        default=WardrobeStatus.OWN,
    )

    rating = serializers.IntegerField(
        required=False,
        allow_null=True,
        validators=[validate_rating_1_10],
    )

    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        trim_whitespace=True,
    )

    is_private = serializers.BooleanField(required=False, default=False)

    def validate_fragrance_id(self, value: int) -> int:
        if not FragranceModel.objects.filter(id=value).exists():
            raise serializers.ValidationError("РђСЂРѕРјР°С‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.")

        return value


class WardrobeItemUpdateSerializer(serializers.Serializer):
    fragrance_id = serializers.IntegerField(min_value=1, required=False)

    status = serializers.ChoiceField(
        choices=WardrobeStatus.choices,
        required=False,
    )

    rating = serializers.IntegerField(
        required=False,
        allow_null=True,
        validators=[validate_rating_1_10],
    )

    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        trim_whitespace=True,
    )

    is_private = serializers.BooleanField(required=False)

    def validate_fragrance_id(self, value: int) -> int:
        if not FragranceModel.objects.filter(id=value).exists():
            raise serializers.ValidationError("РђСЂРѕРјР°С‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.")

        return value

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("РќРµРјР°С” РґР°РЅРёС… РґР»СЏ РѕРЅРѕРІР»РµРЅРЅСЏ.")

        return attrs
