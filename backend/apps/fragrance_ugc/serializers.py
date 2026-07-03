from __future__ import annotations

from rest_framework import serializers

from core.choises.status_choise import STATUS_CHOISE
from core.choises.note_level_choise import NOTE_LEVEL_CHOICES
from core.validators.fragrance_validators import validate_release_year
from core.validators.fragrance_ugc_validators import (
    validate_add_request_payload,
    validate_add_request_staff_update_payload,
    validate_similarity_not_self,
    validate_vote_value,
)

from apps.fragrance_ugc.models import (
    FragranceAddRequestModel,
    FragranceSimilaritySuggestionModel,
    UserFragranceNoteSuggestionModel,
)


class CompactBrandSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    slug = serializers.CharField()


class CompactFragranceSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    slug = serializers.CharField()
    release_year = serializers.IntegerField(allow_null=True)
    brand = CompactBrandSerializer(read_only=True)


class CompactNoteSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    slug = serializers.CharField()


class UserFragranceNoteSuggestionCreateSerializer(serializers.Serializer):
    note_id = serializers.IntegerField(min_value=1)
    level = serializers.ChoiceField(
        choices=NOTE_LEVEL_CHOICES,
        required=False,
        default="top",
    )


class UserFragranceNoteSuggestionSerializer(serializers.ModelSerializer):
    fragrance_id = serializers.IntegerField(read_only=True)
    fragrance = CompactFragranceSerializer(read_only=True)
    note_id = serializers.IntegerField(read_only=True)
    note = CompactNoteSerializer(read_only=True)
    created_by_id = serializers.IntegerField(read_only=True)
    score = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = UserFragranceNoteSuggestionModel
        fields = [
            "id",
            "fragrance_id",
            "fragrance",
            "note_id",
            "note",
            "created_by_id",
            "level",
            "status",
            "moderator_comment",
            "score",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class UserFragranceNoteVoteSerializer(serializers.Serializer):
    value = serializers.IntegerField()

    def validate_value(self, value: int) -> int:
        return validate_vote_value(value)


class FragranceSimilaritySuggestionCreateSerializer(serializers.Serializer):
    similar_fragrance_id = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        fragrance_id = self.context.get("fragrance_id")

        if fragrance_id is not None:
            validate_similarity_not_self(
                fragrance_id,
                attrs.get("similar_fragrance_id"),
            )

        return attrs


class FragranceSimilaritySuggestionSerializer(serializers.ModelSerializer):
    fragrance_id = serializers.IntegerField(read_only=True)
    fragrance = CompactFragranceSerializer(read_only=True)
    similar_fragrance_id = serializers.IntegerField(read_only=True)
    similar_fragrance = CompactFragranceSerializer(read_only=True)
    created_by_id = serializers.IntegerField(read_only=True)
    score = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = FragranceSimilaritySuggestionModel
        fields = [
            "id",
            "fragrance_id",
            "fragrance",
            "similar_fragrance_id",
            "similar_fragrance",
            "created_by_id",
            "status",
            "moderator_comment",
            "score",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class FragranceSimilarityVoteSerializer(serializers.Serializer):
    value = serializers.IntegerField()

    def validate_value(self, value: int) -> int:
        return validate_vote_value(value)


class FragranceAddRequestCreateSerializer(serializers.Serializer):
    brand_name = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255,
        trim_whitespace=True,
    )
    fragrance_name = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255,
        trim_whitespace=True,
    )
    release_year = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        trim_whitespace=True,
    )
    perfumers_text = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        trim_whitespace=True,
    )
    notes_text = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=2000,
        trim_whitespace=True,
    )
    families_text = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        trim_whitespace=True,
    )
    links_text = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=2000,
        trim_whitespace=True,
    )

    def validate_release_year(self, value):
        return validate_release_year(value)

    def validate(self, attrs):
        clean_payload = validate_add_request_payload(attrs)
        attrs.update(clean_payload)
        return attrs


class FragranceAddRequestSerializer(serializers.ModelSerializer):
    created_by_id = serializers.IntegerField(read_only=True)
    processed_by_id = serializers.IntegerField(read_only=True)
    created_fragrance_id = serializers.IntegerField(read_only=True)
    created_fragrance = CompactFragranceSerializer(read_only=True)

    class Meta:
        model = FragranceAddRequestModel
        fields = [
            "id",
            "created_by_id",
            "processed_by_id",
            "brand_name",
            "fragrance_name",
            "release_year",
            "perfumers_text",
            "notes_text",
            "families_text",
            "links_text",
            "status",
            "moderator_comment",
            "created_fragrance_id",
            "created_fragrance",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class ModerationStatusInputSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=STATUS_CHOISE.choices)
    moderator_comment = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
    )

    def validate(self, attrs):
        comment = (attrs.get("moderator_comment") or "").strip()
        if attrs["status"] in {
            STATUS_CHOISE.REJECTED,
            STATUS_CHOISE.REMOVED_BY_MODERATOR,
        } and not comment:
            raise serializers.ValidationError(
                {"moderator_comment": "Р’РєР°Р¶С–С‚СЊ Р·СЂРѕР·СѓРјС–Р»Сѓ РїСЂРёС‡РёРЅСѓ СЂС–С€РµРЅРЅСЏ РґР»СЏ РєРѕСЂРёСЃС‚СѓРІР°С‡Р°."}
            )
        attrs["moderator_comment"] = comment
        return attrs


class AttachCreatedFragranceSerializer(serializers.Serializer):
    fragrance_id = serializers.IntegerField(min_value=1)
    moderator_comment = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
    )


class FragranceAddRequestStaffUpdateSerializer(serializers.Serializer):
    brand_name = serializers.CharField(
        required=False,
        allow_blank=False,
        max_length=255,
        trim_whitespace=True,
    )
    fragrance_name = serializers.CharField(
        required=False,
        allow_blank=False,
        max_length=255,
        trim_whitespace=True,
    )
    release_year = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        trim_whitespace=True,
    )
    perfumers_text = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        trim_whitespace=True,
    )
    notes_text = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=2000,
        trim_whitespace=True,
    )
    families_text = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        trim_whitespace=True,
    )
    links_text = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=2000,
        trim_whitespace=True,
    )
    moderator_comment = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        trim_whitespace=True,
    )

    def validate_release_year(self, value):
        return validate_release_year(value)

    def validate(self, attrs):
        clean_payload = validate_add_request_staff_update_payload(attrs)
        attrs.update(clean_payload)
        return attrs

class FragranceAddRequestCreateFragranceApproveSerializer(serializers.Serializer):
    brand_id = serializers.IntegerField(required=True)

    name = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=255,
        trim_whitespace=True,
    )

    slug = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=255,
        trim_whitespace=True,
    )

    release_year = serializers.IntegerField(
        required=False,
        allow_null=True,
    )

    perfumer_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
    )

    family_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
    )

    top_note_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
    )

    heart_note_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
    )

    base_note_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        allow_empty=True,
    )

    moderator_comment = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
        trim_whitespace=True,
    )

    def validate_release_year(self, value):
        return validate_release_year(value)

    def validate(self, attrs):
        attrs["name"] = attrs["name"].strip()
        attrs["slug"] = attrs.get("slug", "").strip()

        self._validate_no_duplicates(attrs, "perfumer_ids")
        self._validate_no_duplicates(attrs, "family_ids")
        self._validate_no_duplicates(attrs, "top_note_ids")
        self._validate_no_duplicates(attrs, "heart_note_ids")
        self._validate_no_duplicates(attrs, "base_note_ids")

        return attrs

    def _validate_no_duplicates(self, attrs, key: str) -> None:
        values = attrs.get(key) or []

        if len(values) != len(set(values)):
            raise serializers.ValidationError(
                {key: "Р„ РґСѓР±Р»С–РєР°С‚Рё. РџСЂРёР±РµСЂС–С‚СЊ РїРѕРІС‚РѕСЂРё."}
            )
