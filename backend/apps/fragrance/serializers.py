from __future__ import annotations

from rest_framework import serializers

from core.choises.note_level_choise import NOTE_LEVEL_CHOICES
from core.validators.fragrance_validators import (
    clean_required_name,
    validate_brand_exists,
    validate_family_exists,
    validate_note_exists,
    validate_perfumer_exists,
    validate_position,
    validate_release_year,
    validate_unique_dictionary_name,
)

from .models import (
    BrandModel,
    FragranceModel,
    NoteModel,
    OlfactoryFamilyModel,
    PerfumerModel,
)

from .image_selectors import get_fragrance_cover_image


NOTE_LEVEL_ORDER = {
    "top": 0,
    "heart": 1,
    "base": 2,
}


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandModel
        fields = ["id", "name", "slug", "country", "created_at", "updated_at"]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]
        extra_kwargs = {"name": {"validators": []}}

    def validate_name(self, value: str) -> str:
        return validate_unique_dictionary_name(
            model_cls=BrandModel,
            value=value,
            duplicate_msg="Р‘СЂРµРЅРґ С–Р· С‚Р°РєРѕСЋ РЅР°Р·РІРѕСЋ РІР¶Рµ С–СЃРЅСѓС”.",
            empty_msg="РџРѕС‚СЂС–Р±РЅР° РЅР°Р·РІР° Р±СЂРµРЅРґСѓ.",
            max_len=255,
        )


class PerfumerSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfumerModel
        fields = ["id", "name", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {"name": {"validators": []}}

    def validate_name(self, value: str) -> str:
        return validate_unique_dictionary_name(
            model_cls=PerfumerModel,
            value=value,
            duplicate_msg="РџР°СЂС„СѓРјРµСЂ С–Р· С‚Р°РєРёРј С–РјвЂ™СЏРј СѓР¶Рµ С–СЃРЅСѓС”.",
            empty_msg="РџРѕС‚СЂС–Р±РЅРµ С–Рј'СЏ РїР°СЂС„СѓРјРµСЂР°.",
            max_len=255,
        )


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = NoteModel
        fields = ["id", "name", "slug", "created_at", "updated_at"]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]
        extra_kwargs = {"name": {"validators": []}}

    def validate_name(self, value: str) -> str:
        return validate_unique_dictionary_name(
            model_cls=NoteModel,
            value=value,
            duplicate_msg="РќРѕС‚Р° Р· С‚Р°РєРѕСЋ РЅР°Р·РІРѕСЋ РІР¶Рµ С–СЃРЅСѓС”.",
            empty_msg="РџРѕС‚СЂС–Р±РЅР° РЅР°Р·РІР° РЅРѕС‚Рё.",
            max_len=255,
        )


class OlfactoryFamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = OlfactoryFamilyModel
        fields = ["id", "name", "slug", "created_at", "updated_at"]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]
        extra_kwargs = {"name": {"validators": []}}

    def validate_name(self, value: str) -> str:
        return validate_unique_dictionary_name(
            model_cls=OlfactoryFamilyModel,
            value=value,
            duplicate_msg="РЎС–РјРµР№СЃС‚РІРѕ Р· С‚Р°РєРѕСЋ РЅР°Р·РІРѕСЋ РІР¶Рµ С–СЃРЅСѓС”.",
            empty_msg="РџРѕС‚СЂС–Р±РЅР° РЅР°Р·РІР° СЃС–РјРµР№СЃС‚РІР°.",
            max_len=255,
        )


class FragranceOfficialNoteSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    slug = serializers.CharField()
    position = serializers.IntegerField()
    level = serializers.CharField()


class FragranceListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    cover_image = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = FragranceModel
        fields = [
            "id",
            "brand",
            "name",
            "slug",
            "release_year",
            "cover_image",
            "likes_count",
            "is_liked",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_cover_image(self, obj: FragranceModel) -> str | None:
        return get_fragrance_cover_image(obj)

    def get_is_liked(self, obj: FragranceModel) -> bool:
        return bool(getattr(obj, "is_liked", False))


class FragranceDetailSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    perfumers = PerfumerSerializer(many=True, read_only=True)
    families = OlfactoryFamilySerializer(many=True, read_only=True)
    official_notes = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()
    cover = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = FragranceModel
        fields = [
            "id",
            "brand",
            "name",
            "slug",
            "release_year",
            "cover_image",
            "cover",
            "likes_count",
            "is_liked",
            "perfumers",
            "families",
            "official_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_is_liked(self, obj: FragranceModel) -> bool:
        return bool(getattr(obj, "is_liked", False))

    def get_cover_image(self, obj: FragranceModel) -> str | None:
        return get_fragrance_cover_image(obj)

    def get_cover(self, obj: FragranceModel) -> dict | None:
        cover = getattr(obj, "prefetched_cover", None)

        if not cover:
            return None

        return {
            "id": cover.id,
            "image": cover.image.url if cover.image else "",
            "created_at": cover.created_at,
            "updated_at": cover.updated_at,
        }

    def get_official_notes(self, obj: FragranceModel) -> list[dict]:
        links = getattr(obj, "prefetched_official_note_links", None)

        if links is None:
            links = obj.official_note_links.select_related("note")

        sorted_links = sorted(
            list(links),
            key=lambda link: (
                NOTE_LEVEL_ORDER.get(link.level, 99),
                link.position,
                link.id,
            ),
        )

        return [
            {
                "id": link.note_id,
                "name": link.note.name,
                "slug": link.note.slug,
                "position": link.position,
                "level": link.level,
            }
            for link in sorted_links
        ]

class FragranceCreateUpdateInputSerializer(serializers.Serializer):
    brand_id = serializers.IntegerField(required=False)
    name = serializers.CharField(required=False, max_length=255)
    slug = serializers.CharField(required=False, allow_blank=True, max_length=255)
    release_year = serializers.IntegerField(required=False, allow_null=True)

    def validate_brand_id(self, value: int) -> int:
        validate_brand_exists(value)
        return value

    def validate_name(self, value: str) -> str:
        return clean_required_name(
            value=value,
            empty_msg="РџРѕС‚СЂС–Р±РЅР° РЅР°Р·РІР° Р°СЂРѕРјР°С‚Сѓ.",
            max_len=255,
        )

    def validate_slug(self, value: str) -> str:
        return (value or "").strip()

    def validate_release_year(self, value):
        return validate_release_year(value)

    def validate(self, attrs):
        if self.instance is None:
            errors = {}

            if "brand_id" not in attrs:
                errors["brand_id"] = "Р¦Рµ РїРѕР»Рµ С” РѕР±РѕРІ'СЏР·РєРѕРІРёРј."

            if "name" not in attrs:
                errors["name"] = "Р¦Рµ РїРѕР»Рµ С” РѕР±РѕРІ'СЏР·РєРѕРІРёРј."

            if errors:
                raise serializers.ValidationError(errors)

        return attrs


class OfficialPerfumerInputSerializer(serializers.Serializer):
    perfumer_id = serializers.IntegerField()

    def validate_perfumer_id(self, value: int) -> int:
        validate_perfumer_exists(value)
        return value


class OfficialFamilyInputSerializer(serializers.Serializer):
    family_id = serializers.IntegerField()

    def validate_family_id(self, value: int) -> int:
        validate_family_exists(value)
        return value


class OfficialNoteInputSerializer(serializers.Serializer):
    note_id = serializers.IntegerField()
    position = serializers.IntegerField(required=False, default=0)
    level = serializers.ChoiceField(choices=NOTE_LEVEL_CHOICES, required=False, default="top")

    def validate_note_id(self, value: int) -> int:
        validate_note_exists(value)
        return value

    def validate_position(self, value: int) -> int:
        return validate_position(value)


class OfficialNoteMetaInputSerializer(serializers.Serializer):
    position = serializers.IntegerField(required=False)
    level = serializers.ChoiceField(choices=NOTE_LEVEL_CHOICES, required=False)

    def validate_position(self, value: int) -> int:
        return validate_position(value)

    def validate(self, attrs):
        if "position" not in attrs and "level" not in attrs:
            raise serializers.ValidationError(
                {"detail": "РџРѕС‚СЂС–Р±РЅРѕ РїРµСЂРµРґР°С‚Рё position Р°Р±Рѕ level."}
            )

        return attrs

class BrandOptionSerializer(serializers.ModelSerializer):
    label = serializers.CharField(source="name", read_only=True)

    class Meta:
        model = BrandModel
        fields = ["id", "label", "name", "slug"]


class NoteOptionSerializer(serializers.ModelSerializer):
    label = serializers.CharField(source="name", read_only=True)

    class Meta:
        model = NoteModel
        fields = ["id", "label", "name", "slug"]


class OlfactoryFamilyOptionSerializer(serializers.ModelSerializer):
    label = serializers.CharField(source="name", read_only=True)

    class Meta:
        model = OlfactoryFamilyModel
        fields = ["id", "label", "name", "slug"]


class PerfumerOptionSerializer(serializers.ModelSerializer):
    label = serializers.CharField(source="name", read_only=True)

    class Meta:
        model = PerfumerModel
        fields = ["id", "label", "name"]

class OptionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    label = serializers.CharField()


class FragranceOptionSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()
    brand_id = serializers.IntegerField(source="brand.id", read_only=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True)

    class Meta:
        model = FragranceModel
        fields = [
            "id",
            "label",
            "name",
            "slug",
            "release_year",
            "brand_id",
            "brand_name",
        ]
        read_only_fields = fields

    def get_label(self, obj):
        year = f", {obj.release_year}" if obj.release_year else ""
        return f"{obj.brand.name} вЂ” {obj.name}{year}"
