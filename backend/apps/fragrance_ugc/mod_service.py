from __future__ import annotations

from django.db.models import Max
from rest_framework import serializers
from django.db.transaction import atomic, on_commit

from apps.fragrance.models import FragranceNoteOfficialModel

from apps.fragrance.fragrance_service import FragranceService

from apps.fragrance_ugc.models import (
    FragranceAddRequestModel,
    FragranceSimilaritySuggestionModel,
    UserFragranceNoteSuggestionModel,
)
from core.choises.status_choise import STATUS_CHOISE
from core.validators.fragrance_validators import (
    validate_fragrance_exists,
    validate_release_year,
)
from core.validators.fragrance_ugc_validators import (
    validate_add_request_exists,
    validate_add_request_names,
    validate_mod_status,
    validate_note_suggestion_exists,
    validate_similarity_suggestion_exists,
)
_MISSING = object()


class FragranceUGCModService:
    @staticmethod
    def _award_add_request_approved_points_once(req: FragranceAddRequestModel) -> None:
        return None

    @staticmethod
    @atomic
    def set_note_suggestion_status(
        *,
        suggestion_id: int,
        status: str,
        moderator_comment: str = "",
    ) -> UserFragranceNoteSuggestionModel:
        suggestion = validate_note_suggestion_exists(suggestion_id)
        clean_status = validate_mod_status(status)

        suggestion.status = clean_status
        suggestion.moderator_comment = (moderator_comment or "").strip()
        suggestion.save(update_fields=["status", "moderator_comment", "updated_at"])

        if clean_status == STATUS_CHOISE.APPROVED:
            existing_link = FragranceNoteOfficialModel.objects.filter(
                fragrance=suggestion.fragrance,
                note=suggestion.note,
                level=suggestion.level,
            ).first()

            if existing_link is None:
                max_position = (
                    FragranceNoteOfficialModel.objects.filter(
                        fragrance=suggestion.fragrance,
                        level=suggestion.level,
                    ).aggregate(max_position=Max("position"))["max_position"]
                    or 0
                )

                FragranceNoteOfficialModel.objects.create(
                    fragrance=suggestion.fragrance,
                    note=suggestion.note,
                    level=suggestion.level,
                    position=max_position + 1,
                )

        return suggestion

    @staticmethod
    @atomic
    def set_similarity_suggestion_status(
        *,
        suggestion_id: int,
        status: str,
        moderator_comment: str = "",
    ) -> FragranceSimilaritySuggestionModel:
        suggestion = validate_similarity_suggestion_exists(suggestion_id)
        clean_status = validate_mod_status(status)

        suggestion.status = clean_status
        suggestion.moderator_comment = (moderator_comment or "").strip()
        suggestion.save(update_fields=["status", "moderator_comment", "updated_at"])
        return suggestion

    @staticmethod
    @atomic
    def set_add_request_status(
        *,
        request_id: int,
        moderator,
        status: str,
        moderator_comment: str = "",
    ) -> FragranceAddRequestModel:
        req = validate_add_request_exists(request_id)
        clean_status = validate_mod_status(status)

        if req.status == STATUS_CHOISE.APPROVED:
            raise serializers.ValidationError(
                "РЎС…РІР°Р»РµРЅСѓ Р·Р°СЏРІРєСѓ РЅРµ РјРѕР¶РЅР° Р·РјС–РЅСЋРІР°С‚Рё С‡РµСЂРµР· С€РІРёРґРєСѓ Р·РјС–РЅСѓ СЃС‚Р°С‚СѓСЃСѓ."
            )

        if clean_status == STATUS_CHOISE.APPROVED:
            raise serializers.ValidationError(
                "Р—Р°СЏРІРєСѓ РЅРµ РјРѕР¶РЅР° СЃС…РІР°Р»РёС‚Рё РїСЂРѕСЃС‚РѕСЋ Р·РјС–РЅРѕСЋ СЃС‚Р°С‚СѓСЃСѓ. "
                "РЎРїРѕС‡Р°С‚РєСѓ СЃС‚РІРѕСЂС–С‚СЊ Р°Р±Рѕ РїСЂРёРІвЂ™СЏР¶С–С‚СЊ РѕС„С–С†С–Р№РЅРёР№ Р°СЂРѕРјР°С‚."
            )

        req.status = clean_status
        req.moderator_comment = (moderator_comment or "").strip()
        req.processed_by = moderator
        req.save(
            update_fields=[
                "status",
                "moderator_comment",
                "processed_by",
                "updated_at",
            ]
        )
        return req

    @staticmethod
    @atomic
    def update_add_request(
        *,
        request_id: int,
        brand_name=_MISSING,
        fragrance_name=_MISSING,
        release_year=_MISSING,
        perfumers_text=_MISSING,
        notes_text=_MISSING,
        families_text=_MISSING,
        links_text=_MISSING,
        moderator_comment=_MISSING,
    ) -> FragranceAddRequestModel:
        req = validate_add_request_exists(request_id)

        target_brand_name = req.brand_name if brand_name is _MISSING else brand_name
        target_fragrance_name = (
            req.fragrance_name if fragrance_name is _MISSING else fragrance_name
        )

        clean_brand_name, clean_fragrance_name = validate_add_request_names(
            brand_name=target_brand_name,
            fragrance_name=target_fragrance_name,
        )

        req.brand_name = clean_brand_name
        req.fragrance_name = clean_fragrance_name

        if release_year is not _MISSING:
            req.release_year = validate_release_year(release_year)

        if perfumers_text is not _MISSING:
            req.perfumers_text = (perfumers_text or "").strip()

        if notes_text is not _MISSING:
            req.notes_text = (notes_text or "").strip()

        if families_text is not _MISSING:
            req.families_text = (families_text or "").strip()

        if links_text is not _MISSING:
            req.links_text = (links_text or "").strip()

        if moderator_comment is not _MISSING:
            req.moderator_comment = (moderator_comment or "").strip()

        req.save(
            update_fields=[
                "brand_name",
                "fragrance_name",
                "release_year",
                "perfumers_text",
                "notes_text",
                "families_text",
                "links_text",
                "moderator_comment",
                "updated_at",
            ]
        )
        return req

    @staticmethod
    @atomic
    def attach_created_fragrance(
        *,
        request_id: int,
        moderator,
        fragrance_id: int,
        moderator_comment: str = "",
    ) -> FragranceAddRequestModel:
        req = validate_add_request_exists(request_id)
        fragrance = validate_fragrance_exists(fragrance_id)

        if req.status == STATUS_CHOISE.APPROVED:
            raise serializers.ValidationError(
                "РЎС…РІР°Р»РµРЅС–Р№ Р·Р°СЏРІС†С– РЅРµ РјРѕР¶РЅР° Р·РјС–РЅСЋРІР°С‚Рё РїСЂРёРІвЂ™СЏР·Р°РЅРёР№ Р°СЂРѕРјР°С‚ С‡РµСЂРµР· attach."
            )

        req.created_fragrance = fragrance
        req.processed_by = moderator

        if moderator_comment:
            req.moderator_comment = moderator_comment.strip()

        req.save(
            update_fields=[
                "created_fragrance",
                "processed_by",
                "moderator_comment",
                "updated_at",
            ]
        )
        return req

    @staticmethod
    @atomic
    def approve_add_request_with_fragrance(
        *,
        request_id: int,
        moderator,
        fragrance_id: int,
        moderator_comment: str = "",
    ) -> FragranceAddRequestModel:
        req = validate_add_request_exists(request_id)
        fragrance = validate_fragrance_exists(fragrance_id)

        was_already_approved = req.status == STATUS_CHOISE.APPROVED

        if was_already_approved and req.created_fragrance_id:
            if str(req.created_fragrance_id) != str(fragrance.id):
                raise serializers.ValidationError(
                    "Р—Р°СЏРІРєР° РІР¶Рµ СЃС…РІР°Р»РµРЅР° Р· С–РЅС€РёРј Р°СЂРѕРјР°С‚РѕРј. "
                    "РќРµ РјРѕР¶РЅР° Р·Р°РјС–РЅРёС‚Рё Р°СЂРѕРјР°С‚ РїРѕРІС‚РѕСЂРЅРёРј СЃС…РІР°Р»РµРЅРЅСЏРј."
                )

        req.created_fragrance = fragrance
        req.status = STATUS_CHOISE.APPROVED
        req.moderator_comment = (moderator_comment or "").strip()
        req.processed_by = moderator
        req.save(
            update_fields=[
                "created_fragrance",
                "status",
                "moderator_comment",
                "processed_by",
                "updated_at",
            ]
        )

        if not was_already_approved:
            FragranceUGCModService._award_add_request_approved_points_once(req)

        return req

    @staticmethod
    @atomic
    def create_fragrance_from_add_request_and_approve(
        *,
        request_id: int,
        moderator,
        brand_id: int,
        name: str,
        slug: str = "",
        release_year=None,
        perfumer_ids: list[int] | None = None,
        family_ids: list[int] | None = None,
        top_note_ids: list[int] | None = None,
        heart_note_ids: list[int] | None = None,
        base_note_ids: list[int] | None = None,
        moderator_comment: str = "",
    ) -> FragranceAddRequestModel:
        req = validate_add_request_exists(request_id)

        if req.status == STATUS_CHOISE.APPROVED:
            raise serializers.ValidationError(
                "Р¦СЏ Р·Р°СЏРІРєР° РІР¶Рµ СЃС…РІР°Р»РµРЅР°."
            )

        if req.created_fragrance_id:
            raise serializers.ValidationError(
                "Р”Рѕ С†С–С”С— Р·Р°СЏРІРєРё РІР¶Рµ РїСЂРёРІвЂ™СЏР·Р°РЅРёР№ Р°СЂРѕРјР°С‚. "
                "РЎС…РІР°Р»С–С‚СЊ Р·Р°СЏРІРєСѓ Р· РїСЂРёРІвЂ™СЏР·Р°РЅРёРј Р°СЂРѕРјР°С‚РѕРј Р°Р±Рѕ РІРёРєРѕСЂРёСЃС‚Р°Р№С‚Рµ С–РЅС€РёР№ СЃС†РµРЅР°СЂС–Р№."
            )

        fragrance = FragranceService.create_fragrance_with_relations(
            brand_id=brand_id,
            name=name,
            slug=slug,
            release_year=release_year,
            perfumer_ids=perfumer_ids,
            family_ids=family_ids,
            top_note_ids=top_note_ids,
            heart_note_ids=heart_note_ids,
            base_note_ids=base_note_ids,
        )

        req.created_fragrance = fragrance
        req.status = STATUS_CHOISE.APPROVED
        req.moderator_comment = (moderator_comment or "").strip()
        req.processed_by = moderator
        req.save(
            update_fields=[
                "created_fragrance",
                "status",
                "moderator_comment",
                "processed_by",
                "updated_at",
            ]
        )

        FragranceUGCModService._award_add_request_approved_points_once(req)

        return req
