from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.db.transaction import atomic

from apps.fragrance.models import (
    BrandModel,
    FragranceModel,
    NoteModel,
    OlfactoryFamilyModel,
    PerfumerModel,
)

from apps.taste_profile.activity import (
    publish_taste_profile_created_activity,
    publish_taste_profile_updated_activity,
)
from core.choises.taste_profile_choise import TastePriority
from .models import (
    TasteBrandPreferenceModel,
    TasteConcentrationPreferenceModel,
    TasteFamilyPreferenceModel,
    TasteFragranceMarkModel,
    TasteNotePreferenceModel,
    TastePerfumerPreferenceModel,
    TasteProfileModel,
    TasteSeasonPreferenceModel,
)


class TasteProfileError(Exception):
    pass


def clean_comment(value: str | None) -> str:
    return (value or "").strip()


def clean_about(value: str | None) -> str:
    return (value or "").strip()


def get_object_or_error(model, object_id: int, message: str):
    obj = model.objects.filter(id=object_id).first()

    if obj is None:
        raise TasteProfileError(message)

    return obj


def get_profile_item_or_error(model, *, user, item_id: int, select_related: tuple[str, ...] = ()):
    qs = model.objects.filter(id=item_id, profile__user=user)

    if select_related:
        qs = qs.select_related(*select_related)

    item = qs.first()

    if item is None:
        raise TasteProfileError("Р•Р»РµРјРµРЅС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.")

    return item


class TasteProfileService:
    @staticmethod
    @atomic
    def get_or_create_profile(user) -> TasteProfileModel:
        profile, created = TasteProfileModel.objects.get_or_create(
            user=user,
            defaults={
                "is_public": True,
                "about": "",
            },
        )

        if created:
            publish_taste_profile_created_activity(profile=profile)

        return profile

    @staticmethod
    @atomic
    def update_profile(user, *, data: dict) -> TasteProfileModel:
        profile = TasteProfileService.get_or_create_profile(user)

        changed_fields = []

        if "is_public" in data and profile.is_public != data["is_public"]:
            profile.is_public = data["is_public"]
            changed_fields.append("is_public")

        if "about" in data:
            about = clean_about(data.get("about"))

            if profile.about != about:
                profile.about = about
                changed_fields.append("about")

        if not changed_fields:
            return profile

        profile.save(update_fields=[*changed_fields, "updated_at"])

        publish_taste_profile_updated_activity(profile=profile)

        return profile

    @staticmethod
    @atomic
    def _upsert_fk_preference(
        *,
        user,
        model,
        entity_model,
        entity_field: str,
        entity_id: int,
        entity_error: str,
        attitude: str,
        comment: str = "",
    ):
        profile = TasteProfileService.get_or_create_profile(user)
        entity = get_object_or_error(entity_model, entity_id, entity_error)

        try:
            item, created = model.objects.get_or_create(
                profile=profile,
                **{entity_field: entity},
                defaults={
                    "attitude": attitude,
                    "comment": clean_comment(comment),
                },
            )
        except (IntegrityError, ValidationError) as exc:
            raise TasteProfileError(str(exc))

        if created:
            publish_taste_profile_updated_activity(profile=profile)
            return model.objects.select_related("profile", entity_field).get(id=item.id)

        changed_fields = []

        if item.attitude != attitude:
            item.attitude = attitude
            changed_fields.append("attitude")

        cleaned_comment = clean_comment(comment)

        if item.comment != cleaned_comment:
            item.comment = cleaned_comment
            changed_fields.append("comment")

        if changed_fields:
            item.save(update_fields=[*changed_fields, "updated_at"])
            publish_taste_profile_updated_activity(profile=profile)

        return model.objects.select_related("profile", entity_field).get(id=item.id)

    @staticmethod
    @atomic
    def _update_fk_preference(
        *,
        user,
        item_id: int,
        model,
        entity_model,
        entity_field: str,
        entity_id: int | None,
        entity_error: str,
        data: dict,
    ):
        item = get_profile_item_or_error(
            model,
            user=user,
            item_id=item_id,
            select_related=("profile", entity_field),
        )

        changed_fields = []

        if entity_id is not None:
            entity = get_object_or_error(entity_model, entity_id, entity_error)

            if getattr(item, f"{entity_field}_id") != entity.id:
                setattr(item, entity_field, entity)
                changed_fields.append(entity_field)

        if "attitude" in data and item.attitude != data["attitude"]:
            item.attitude = data["attitude"]
            changed_fields.append("attitude")

        if "comment" in data:
            cleaned_comment = clean_comment(data.get("comment"))

            if item.comment != cleaned_comment:
                item.comment = cleaned_comment
                changed_fields.append("comment")

        if not changed_fields:
            return item

        try:
            item.save(update_fields=[*changed_fields, "updated_at"])
        except IntegrityError:
            raise TasteProfileError("РўР°РєРёР№ РµР»РµРјРµРЅС‚ СѓР¶Рµ С” Сѓ РїСЂРѕС„С–Р»С–.")
        except ValidationError as exc:
            raise TasteProfileError(str(exc))

        publish_taste_profile_updated_activity(profile=item.profile)

        return model.objects.select_related("profile", entity_field).get(id=item.id)

    @staticmethod
    @atomic
    def _delete_item(*, user, model, item_id: int) -> int:
        deleted, _ = model.objects.filter(
            id=item_id,
            profile__user=user,
        ).delete()

        return deleted

    @staticmethod
    def create_family_preference(user, *, family_id: int, attitude: str, comment: str = ""):
        return TasteProfileService._upsert_fk_preference(
            user=user,
            model=TasteFamilyPreferenceModel,
            entity_model=OlfactoryFamilyModel,
            entity_field="family",
            entity_id=family_id,
            entity_error="РЎС–РјРµР№СЃС‚РІРѕ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.",
            attitude=attitude,
            comment=comment,
        )

    @staticmethod
    def update_family_preference(user, item_id: int, *, data: dict):
        return TasteProfileService._update_fk_preference(
            user=user,
            item_id=item_id,
            model=TasteFamilyPreferenceModel,
            entity_model=OlfactoryFamilyModel,
            entity_field="family",
            entity_id=data.get("family_id"),
            entity_error="РЎС–РјРµР№СЃС‚РІРѕ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.",
            data=data,
        )

    @staticmethod
    def delete_family_preference(user, item_id: int) -> int:
        return TasteProfileService._delete_item(
            user=user,
            model=TasteFamilyPreferenceModel,
            item_id=item_id,
        )

    @staticmethod
    def create_note_preference(user, *, note_id: int, attitude: str, comment: str = ""):
        return TasteProfileService._upsert_fk_preference(
            user=user,
            model=TasteNotePreferenceModel,
            entity_model=NoteModel,
            entity_field="note",
            entity_id=note_id,
            entity_error="РќРѕС‚Сѓ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.",
            attitude=attitude,
            comment=comment,
        )

    @staticmethod
    def update_note_preference(user, item_id: int, *, data: dict):
        return TasteProfileService._update_fk_preference(
            user=user,
            item_id=item_id,
            model=TasteNotePreferenceModel,
            entity_model=NoteModel,
            entity_field="note",
            entity_id=data.get("note_id"),
            entity_error="РќРѕС‚Сѓ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.",
            data=data,
        )

    @staticmethod
    def delete_note_preference(user, item_id: int) -> int:
        return TasteProfileService._delete_item(
            user=user,
            model=TasteNotePreferenceModel,
            item_id=item_id,
        )

    @staticmethod
    def create_perfumer_preference(user, *, perfumer_id: int, attitude: str, comment: str = ""):
        return TasteProfileService._upsert_fk_preference(
            user=user,
            model=TastePerfumerPreferenceModel,
            entity_model=PerfumerModel,
            entity_field="perfumer",
            entity_id=perfumer_id,
            entity_error="РџР°СЂС„СѓРјРµСЂР° РЅРµ Р·РЅР°Р№РґРµРЅРѕ.",
            attitude=attitude,
            comment=comment,
        )

    @staticmethod
    def update_perfumer_preference(user, item_id: int, *, data: dict):
        return TasteProfileService._update_fk_preference(
            user=user,
            item_id=item_id,
            model=TastePerfumerPreferenceModel,
            entity_model=PerfumerModel,
            entity_field="perfumer",
            entity_id=data.get("perfumer_id"),
            entity_error="РџР°СЂС„СѓРјРµСЂР° РЅРµ Р·РЅР°Р№РґРµРЅРѕ.",
            data=data,
        )

    @staticmethod
    def delete_perfumer_preference(user, item_id: int) -> int:
        return TasteProfileService._delete_item(
            user=user,
            model=TastePerfumerPreferenceModel,
            item_id=item_id,
        )

    @staticmethod
    def create_brand_preference(user, *, brand_id: int, attitude: str, comment: str = ""):
        return TasteProfileService._upsert_fk_preference(
            user=user,
            model=TasteBrandPreferenceModel,
            entity_model=BrandModel,
            entity_field="brand",
            entity_id=brand_id,
            entity_error="Р‘СЂРµРЅРґ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.",
            attitude=attitude,
            comment=comment,
        )

    @staticmethod
    def update_brand_preference(user, item_id: int, *, data: dict):
        return TasteProfileService._update_fk_preference(
            user=user,
            item_id=item_id,
            model=TasteBrandPreferenceModel,
            entity_model=BrandModel,
            entity_field="brand",
            entity_id=data.get("brand_id"),
            entity_error="Р‘СЂРµРЅРґ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.",
            data=data,
        )

    @staticmethod
    def delete_brand_preference(user, item_id: int) -> int:
        return TasteProfileService._delete_item(
            user=user,
            model=TasteBrandPreferenceModel,
            item_id=item_id,
        )

    @staticmethod
    @atomic
    def create_season_preference(user, *, season: str, attitude: str, comment: str = ""):
        profile = TasteProfileService.get_or_create_profile(user)

        item, created = TasteSeasonPreferenceModel.objects.get_or_create(
            profile=profile,
            season=season,
            defaults={
                "attitude": attitude,
                "comment": clean_comment(comment),
            },
        )

        if not created:
            changed_fields = []

            if item.attitude != attitude:
                item.attitude = attitude
                changed_fields.append("attitude")

            cleaned_comment = clean_comment(comment)

            if item.comment != cleaned_comment:
                item.comment = cleaned_comment
                changed_fields.append("comment")

            if changed_fields:
                item.save(update_fields=[*changed_fields, "updated_at"])

        publish_taste_profile_updated_activity(profile=profile)

        return item

    @staticmethod
    @atomic
    def update_season_preference(user, item_id: int, *, data: dict):
        item = get_profile_item_or_error(
            TasteSeasonPreferenceModel,
            user=user,
            item_id=item_id,
            select_related=("profile",),
        )

        changed_fields = []

        if "season" in data and item.season != data["season"]:
            item.season = data["season"]
            changed_fields.append("season")

        if "attitude" in data and item.attitude != data["attitude"]:
            item.attitude = data["attitude"]
            changed_fields.append("attitude")

        if "comment" in data:
            cleaned_comment = clean_comment(data.get("comment"))

            if item.comment != cleaned_comment:
                item.comment = cleaned_comment
                changed_fields.append("comment")

        if not changed_fields:
            return item

        try:
            item.save(update_fields=[*changed_fields, "updated_at"])
        except IntegrityError:
            raise TasteProfileError("РўР°РєРёР№ СЃРµР·РѕРЅ СѓР¶Рµ С” Сѓ РїСЂРѕС„С–Р»С–.")

        publish_taste_profile_updated_activity(profile=item.profile)

        return item

    @staticmethod
    def delete_season_preference(user, item_id: int) -> int:
        return TasteProfileService._delete_item(
            user=user,
            model=TasteSeasonPreferenceModel,
            item_id=item_id,
        )

    @staticmethod
    @atomic
    def create_concentration_preference(user, *, concentration: str, attitude: str, comment: str = ""):
        profile = TasteProfileService.get_or_create_profile(user)

        item, created = TasteConcentrationPreferenceModel.objects.get_or_create(
            profile=profile,
            concentration=concentration,
            defaults={
                "attitude": attitude,
                "comment": clean_comment(comment),
            },
        )

        if not created:
            changed_fields = []

            if item.attitude != attitude:
                item.attitude = attitude
                changed_fields.append("attitude")

            cleaned_comment = clean_comment(comment)

            if item.comment != cleaned_comment:
                item.comment = cleaned_comment
                changed_fields.append("comment")

            if changed_fields:
                item.save(update_fields=[*changed_fields, "updated_at"])

        publish_taste_profile_updated_activity(profile=profile)

        return item

    @staticmethod
    @atomic
    def update_concentration_preference(user, item_id: int, *, data: dict):
        item = get_profile_item_or_error(
            TasteConcentrationPreferenceModel,
            user=user,
            item_id=item_id,
            select_related=("profile",),
        )

        changed_fields = []

        if "concentration" in data and item.concentration != data["concentration"]:
            item.concentration = data["concentration"]
            changed_fields.append("concentration")

        if "attitude" in data and item.attitude != data["attitude"]:
            item.attitude = data["attitude"]
            changed_fields.append("attitude")

        if "comment" in data:
            cleaned_comment = clean_comment(data.get("comment"))

            if item.comment != cleaned_comment:
                item.comment = cleaned_comment
                changed_fields.append("comment")

        if not changed_fields:
            return item

        try:
            item.save(update_fields=[*changed_fields, "updated_at"])
        except IntegrityError:
            raise TasteProfileError("РўР°РєР° РєРѕРЅС†РµРЅС‚СЂР°С†С–СЏ РІР¶Рµ С” Сѓ РїСЂРѕС„С–Р»С–.")

        publish_taste_profile_updated_activity(profile=item.profile)

        return item

    @staticmethod
    def delete_concentration_preference(user, item_id: int) -> int:
        return TasteProfileService._delete_item(
            user=user,
            model=TasteConcentrationPreferenceModel,
            item_id=item_id,
        )

    @staticmethod
    @atomic
    def create_fragrance_mark(
        user,
        *,
        fragrance_id: int,
        mark: str,
        priority: str = TastePriority.NORMAL,
        comment: str = "",
    ):
        profile = TasteProfileService.get_or_create_profile(user)
        fragrance = get_object_or_error(
            FragranceModel,
            fragrance_id,
            "РђСЂРѕРјР°С‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.",
        )

        item, created = TasteFragranceMarkModel.objects.get_or_create(
            profile=profile,
            fragrance=fragrance,
            defaults={
                "mark": mark,
                "priority": priority,
                "comment": clean_comment(comment),
            },
        )

        if not created:
            changed_fields = []

            if item.mark != mark:
                item.mark = mark
                changed_fields.append("mark")

            if item.priority != priority:
                item.priority = priority
                changed_fields.append("priority")

            cleaned_comment = clean_comment(comment)

            if item.comment != cleaned_comment:
                item.comment = cleaned_comment
                changed_fields.append("comment")

            if changed_fields:
                item.save(update_fields=[*changed_fields, "updated_at"])

        publish_taste_profile_updated_activity(profile=profile)

        return (
            TasteFragranceMarkModel.objects
            .select_related("profile", "fragrance", "fragrance__brand")
            .get(id=item.id)
        )

    @staticmethod
    @atomic
    def update_fragrance_mark(user, item_id: int, *, data: dict):
        item = get_profile_item_or_error(
            TasteFragranceMarkModel,
            user=user,
            item_id=item_id,
            select_related=("profile", "fragrance", "fragrance__brand"),
        )

        changed_fields = []

        if "fragrance_id" in data:
            fragrance = get_object_or_error(
                FragranceModel,
                data["fragrance_id"],
                "РђСЂРѕРјР°С‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.",
            )

            if item.fragrance_id != fragrance.id:
                item.fragrance = fragrance
                changed_fields.append("fragrance")

        for field in ("mark", "priority"):
            if field in data and getattr(item, field) != data[field]:
                setattr(item, field, data[field])
                changed_fields.append(field)

        if "comment" in data:
            cleaned_comment = clean_comment(data.get("comment"))

            if item.comment != cleaned_comment:
                item.comment = cleaned_comment
                changed_fields.append("comment")

        if not changed_fields:
            return item

        try:
            item.save(update_fields=[*changed_fields, "updated_at"])
        except IntegrityError:
            raise TasteProfileError("РўР°РєРёР№ Р°СЂРѕРјР°С‚ СѓР¶Рµ С” Сѓ РїСЂРѕС„С–Р»С–.")

        publish_taste_profile_updated_activity(profile=item.profile)

        return (
            TasteFragranceMarkModel.objects
            .select_related("profile", "fragrance", "fragrance__brand")
            .get(id=item.id)
        )

    @staticmethod
    def delete_fragrance_mark(user, item_id: int) -> int:
        return TasteProfileService._delete_item(
            user=user,
            model=TasteFragranceMarkModel,
            item_id=item_id,
        )
