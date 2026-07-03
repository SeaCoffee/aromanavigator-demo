from __future__ import annotations

from django.db.transaction import atomic
from rest_framework import serializers

from apps.fragrance.models import (
    FragranceFamilyModel,
    FragranceModel,
    FragranceNoteOfficialModel,
    FragrancePerfumerModel,
)
from core.validators.fragrance_validators import (
    validate_brand_exists,
    validate_family_exists,
    validate_fragrance_exists,
    validate_note_exists,
    validate_note_level,
    validate_official_note_not_exists_for_level,
    validate_perfumer_exists,
    validate_position,
    validate_release_year,
    validate_unique_fragrance_name_for_brand,
)

from .slug_service import FragranceSlugService


class FragranceService:
    @staticmethod
    def build_fragrance_slug(
        *,
        brand_name: str,
        brand_slug: str = "",
        name: str,
        raw_slug: str = "",
        instance_id: int | None = None,
    ) -> str:
        raw_slug = (raw_slug or "").strip()
        if raw_slug and raw_slug.casefold() == (brand_slug or "").strip().casefold():
            raise serializers.ValidationError(
                {
                    "slug": (
                        "Slug Р°СЂРѕРјР°С‚Сѓ РЅРµ РјРѕР¶Рµ Р·Р±С–РіР°С‚РёСЃСЏ Р·С– slug Р±СЂРµРЅРґСѓ. "
                        "Р—Р°Р»РёС€С‚Рµ РїРѕР»Рµ РїРѕСЂРѕР¶РЅС–Рј РґР»СЏ Р°РІС‚РѕРјР°С‚РёС‡РЅРѕРіРѕ С„РѕСЂРјСѓРІР°РЅРЅСЏ."
                    )
                }
            )
        value = raw_slug or f"{brand_name} {name}"

        return FragranceSlugService.build_unique_slug(
            model_cls=FragranceModel,
            value=value,
            instance_id=instance_id,
        )

    @staticmethod
    @atomic
    def create_fragrance(
        *,
        brand_id: int,
        name: str,
        slug: str = "",
        release_year=None,
    ) -> FragranceModel:
        brand = validate_brand_exists(brand_id)

        clean_name = validate_unique_fragrance_name_for_brand(
            brand_id=brand.id,
            name=name,
        )
        clean_year = validate_release_year(release_year)
        clean_slug = FragranceService.build_fragrance_slug(
            brand_name=brand.name,
            brand_slug=brand.slug,
            name=clean_name,
            raw_slug=slug,
        )

        return FragranceModel.objects.create(
            brand=brand,
            name=clean_name,
            slug=clean_slug,
            release_year=clean_year,
        )

    @staticmethod
    @atomic
    def update_fragrance(
        *,
        fragrance: FragranceModel,
        brand_id: int | None = None,
        name: str | None = None,
        slug: str | None = None,
        release_year=None,
    ) -> FragranceModel:
        target_brand = fragrance.brand

        if brand_id is not None:
            target_brand = validate_brand_exists(brand_id)

        target_name = name if name is not None else fragrance.name

        clean_name = validate_unique_fragrance_name_for_brand(
            brand_id=target_brand.id,
            name=target_name,
            exclude_id=fragrance.id,
        )
        clean_year = validate_release_year(release_year)

        clean_slug = fragrance.slug
        if slug is not None:
            clean_slug = FragranceService.build_fragrance_slug(
                brand_name=target_brand.name,
                brand_slug=target_brand.slug,
                name=clean_name,
                raw_slug=slug,
                instance_id=fragrance.id,
            )

        fragrance.brand = target_brand
        fragrance.name = clean_name
        fragrance.slug = clean_slug
        fragrance.release_year = clean_year
        fragrance.save(
            update_fields=[
                "brand",
                "name",
                "slug",
                "release_year",
                "updated_at",
            ]
        )

        return fragrance

    @staticmethod
    @atomic
    def add_official_perfumer(*, fragrance_id: int, perfumer_id: int) -> None:
        fragrance = validate_fragrance_exists(fragrance_id)
        perfumer = validate_perfumer_exists(perfumer_id)

        _, created = FragrancePerfumerModel.objects.get_or_create(
            fragrance=fragrance,
            perfumer=perfumer,
        )

        if not created:
            raise serializers.ValidationError(
                {"perfumer_id": "Р¦РµР№ РїР°СЂС„СѓРјРµСЂ СѓР¶Рµ РґРѕРґР°РЅРёР№ РґРѕ Р°СЂРѕРјР°С‚Сѓ."}
            )

    @staticmethod
    @atomic
    def remove_official_perfumer(*, fragrance_id: int, perfumer_id: int) -> None:
        validate_fragrance_exists(fragrance_id)
        validate_perfumer_exists(perfumer_id)

        deleted_count, _ = FragrancePerfumerModel.objects.filter(
            fragrance_id=fragrance_id,
            perfumer_id=perfumer_id,
        ).delete()

        if deleted_count == 0:
            raise serializers.ValidationError(
                {"perfumer_id": "РџР°СЂС„СѓРјРµСЂР° РЅРµ Р·РЅР°Р№РґРµРЅРѕ СЃРµСЂРµРґ РѕС„С–С†С–Р№РЅРёС… РїР°СЂС„СѓРјРµСЂС–РІ Р°СЂРѕРјР°С‚Сѓ."}
            )

    @staticmethod
    @atomic
    def add_official_family(*, fragrance_id: int, family_id: int) -> None:
        fragrance = validate_fragrance_exists(fragrance_id)
        family = validate_family_exists(family_id)

        _, created = FragranceFamilyModel.objects.get_or_create(
            fragrance=fragrance,
            family=family,
        )

        if not created:
            raise serializers.ValidationError(
                {"family_id": "Р¦Рµ СЃС–РјРµР№СЃС‚РІРѕ СѓР¶Рµ РґРѕРґР°РЅРѕ РґРѕ Р°СЂРѕРјР°С‚Сѓ."}
            )

    @staticmethod
    @atomic
    def remove_official_family(*, fragrance_id: int, family_id: int) -> None:
        validate_fragrance_exists(fragrance_id)
        validate_family_exists(family_id)

        deleted_count, _ = FragranceFamilyModel.objects.filter(
            fragrance_id=fragrance_id,
            family_id=family_id,
        ).delete()

        if deleted_count == 0:
            raise serializers.ValidationError(
                {"family_id": "РЎС–РјРµР№СЃС‚РІРѕ РЅРµ Р·РЅР°Р№РґРµРЅРѕ СЃРµСЂРµРґ РѕС„С–С†С–Р№РЅРёС… СЃС–РјРµР№СЃС‚РІ Р°СЂРѕРјР°С‚Сѓ."}
            )

    @staticmethod
    @atomic
    def add_official_note(
        *,
        fragrance_id: int,
        note_id: int,
        position: int = 0,
        level: str = "top",
    ) -> FragranceNoteOfficialModel:
        fragrance = validate_fragrance_exists(fragrance_id)
        note = validate_note_exists(note_id)
        clean_level = validate_note_level(level)
        clean_position = validate_position(position)

        validate_official_note_not_exists_for_level(
            fragrance=fragrance,
            note=note,
            level=clean_level,
        )

        return FragranceNoteOfficialModel.objects.create(
            fragrance=fragrance,
            note=note,
            position=clean_position,
            level=clean_level,
        )

    @staticmethod
    @atomic
    def update_official_note_meta(
        *,
        fragrance_id: int,
        note_id: int,
        current_level: str,
        position: int | None = None,
        new_level: str | None = None,
    ) -> None:
        validate_fragrance_exists(fragrance_id)
        validate_note_exists(note_id)

        clean_current_level = validate_note_level(current_level)

        row = FragranceNoteOfficialModel.objects.filter(
            fragrance_id=fragrance_id,
            note_id=note_id,
            level=clean_current_level,
        ).select_related("fragrance", "note").first()

        if not row:
            raise serializers.ValidationError(
                {
                    "note_id": (
                        "РќРѕС‚Р° РЅРµ Р·РЅР°Р№РґРµРЅР° РІ РѕС„С–С†С–Р№РЅРёС… РЅРѕС‚Р°С… С†СЊРѕРіРѕ Р°СЂРѕРјР°С‚Сѓ "
                        "РЅР° С†СЊРѕРјСѓ СЂС–РІРЅС–."
                    )
                }
            )

        target_level = validate_note_level(new_level) if new_level is not None else row.level
        target_position = validate_position(position) if position is not None else row.position

        if target_level != row.level:
            validate_official_note_not_exists_for_level(
                fragrance=row.fragrance,
                note=row.note,
                level=target_level,
            )

        row.position = target_position
        row.level = target_level
        row.save(update_fields=["position", "level", "updated_at"])

    @staticmethod
    @atomic
    def remove_official_note(*, fragrance_id: int, note_id: int, level: str) -> None:
        validate_fragrance_exists(fragrance_id)
        validate_note_exists(note_id)

        clean_level = validate_note_level(level)

        deleted_count, _ = FragranceNoteOfficialModel.objects.filter(
            fragrance_id=fragrance_id,
            note_id=note_id,
            level=clean_level,
        ).delete()

        if deleted_count == 0:
            raise serializers.ValidationError(
                {"note_id": "РќРѕС‚Р° РЅРµ Р·РЅР°Р№РґРµРЅР° РІ РѕС„С–С†С–Р№РЅРёС… РЅРѕС‚Р°С… С†СЊРѕРіРѕ Р°СЂРѕРјР°С‚Сѓ РЅР° С†СЊРѕРјСѓ СЂС–РІРЅС–."}
            )

    @staticmethod
    @atomic
    def create_fragrance_with_relations(
        *,
        brand_id: int,
        name: str,
        slug: str = "",
        release_year=None,
        perfumer_ids: list[int] | None = None,
        family_ids: list[int] | None = None,
        top_note_ids: list[int] | None = None,
        heart_note_ids: list[int] | None = None,
        base_note_ids: list[int] | None = None,
    ) -> FragranceModel:
        fragrance = FragranceService.create_fragrance(
            brand_id=brand_id,
            name=name,
            slug=slug,
            release_year=release_year,
        )

        for perfumer_id in perfumer_ids or []:
            FragranceService.add_official_perfumer(
                fragrance_id=fragrance.id,
                perfumer_id=perfumer_id,
            )

        for family_id in family_ids or []:
            FragranceService.add_official_family(
                fragrance_id=fragrance.id,
                family_id=family_id,
            )

        note_groups = {
            "top": top_note_ids or [],
            "heart": heart_note_ids or [],
            "base": base_note_ids or [],
        }

        for level, note_ids in note_groups.items():
            for position, note_id in enumerate(note_ids):
                FragranceService.add_official_note(
                    fragrance_id=fragrance.id,
                    note_id=note_id,
                    level=level,
                    position=position,
                )

        return fragrance
