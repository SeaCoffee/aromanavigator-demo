from __future__ import annotations

import logging
from typing import Any

from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.db.models import Max

from apps.photos.models import (
    ObjectCoverModel,
    ObjectPhotoModel,
    PerfumePhotoModel,
    PrivateObjectPhotoModel,
)
from apps.photos.target_registry import policy_for_content_type, target_supports
from apps.photos.image_processing import add_watermark_and_save, normalize_image_and_save

logger = logging.getLogger(__name__)


class PhotoService:
    @staticmethod
    def content_type_for(obj) -> ContentType:
        return ContentType.objects.get_for_model(obj, for_concrete_model=False)

    @staticmethod
    def _save_image(instance, content_file, filename: str = "image.jpg"):
        """
        Р’Р°Р¶РЅРѕ:
        РќР• РІС‹Р·С‹РІР°РµРј field.generate_filename() СЂСѓРєР°РјРё.
        instance.image.save() СЃР°Рј РїСЂРёРјРµРЅРёС‚ upload_to.
        Рђ upload_to СѓР¶Рµ РіРµРЅРµСЂРёСЂСѓРµС‚ Р±РµР·РѕРїР°СЃРЅРѕРµ uuid-РёРјСЏ.
        """
        instance.image.save(filename, content_file, save=True)
        return instance

    @staticmethod
    def _schedule_file_delete(field_file) -> None:
        """
        РЈРґР°Р»СЏРµРј С„РёР·РёС‡РµСЃРєРёР№ С„Р°Р№Р» С‚РѕР»СЊРєРѕ РїРѕСЃР»Рµ СѓСЃРїРµС€РЅРѕРіРѕ commit.
        РРЅР°С‡Рµ РјРѕР¶РЅРѕ РїРѕС‚РµСЂСЏС‚СЊ С„Р°Р№Р», РµСЃР»Рё Р‘Р”-С‚СЂР°РЅР·Р°РєС†РёСЏ РѕС‚РєР°С‚РёС‚СЃСЏ.
        """
        if not field_file:
            return

        storage = getattr(field_file, "storage", None)
        name = getattr(field_file, "name", "")

        if not storage or not name:
            return

        def delete_file() -> None:
            try:
                storage.delete(name)
            except Exception:
                logger.exception("Failed to delete photo file: %s", name)

        transaction.on_commit(delete_file)

    @staticmethod
    def _schedule_old_files_delete(instances: list[Any]) -> None:
        for instance in instances:
            PhotoService._schedule_file_delete(getattr(instance, "image", None))

    @staticmethod
    def _prepare_cover_image(obj, file):
        content_type = PhotoService.content_type_for(obj)
        policy = policy_for_content_type(content_type)

        if policy and not policy.watermark_cover:
            return normalize_image_and_save(file)

        return add_watermark_and_save(file)

    # =========================
    # PERFUME PHOTOS
    # =========================

    @staticmethod
    @transaction.atomic
    def replace_one(obj, photo_type: str, file) -> PerfumePhotoModel:
        """
        Р—Р°РјРµРЅСЏРµС‚ РѕРґРЅРѕ С„РѕС‚Рѕ РєРѕРЅРєСЂРµС‚РЅРѕРіРѕ С‚РёРїР°.
        РЎС‚Р°СЂС‹Р№ DB-row СѓРґР°Р»СЏРµС‚СЃСЏ РІ С‚СЂР°РЅР·Р°РєС†РёРё.
        РЎС‚Р°СЂС‹Р№ С„РёР·РёС‡РµСЃРєРёР№ С„Р°Р№Р» СѓРґР°Р»СЏРµС‚СЃСЏ РїРѕСЃР»Рµ commit.
        """
        ct = PhotoService.content_type_for(obj)
        if not target_supports(ct, "typed_perfume_photos"):
            raise ValueError("Target does not support typed perfume photos.")

        old_photos = list(
            PerfumePhotoModel.objects
            .filter(content_type=ct, object_id=obj.pk, type=photo_type)
            .only("id", "image")
        )

        if old_photos:
            PerfumePhotoModel.objects.filter(id__in=[photo.id for photo in old_photos]).delete()

        photo = PerfumePhotoModel(
            content_type=ct,
            object_id=obj.pk,
            type=photo_type,
        )

        watermarked = add_watermark_and_save(file)
        PhotoService._save_image(photo, watermarked, filename="image.jpg")

        PhotoService._schedule_old_files_delete(old_photos)

        return photo

    @staticmethod
    @transaction.atomic
    def replace_bulk(obj, files_by_type: dict[str, Any]) -> list[str]:
        """
        РњР°СЃСЃРѕРІР°СЏ Р·Р°РјРµРЅР° РїРѕ СЃР»РѕРІР°СЂСЋ:
        {
            "full": file,
            "bottom": file,
            ...
        }
        """
        ct = PhotoService.content_type_for(obj)
        if not target_supports(ct, "typed_perfume_photos"):
            raise ValueError("Target does not support typed perfume photos.")
        photo_types = list(files_by_type.keys())

        old_photos = list(
            PerfumePhotoModel.objects
            .filter(content_type=ct, object_id=obj.pk, type__in=photo_types)
            .only("id", "image")
        )

        if old_photos:
            PerfumePhotoModel.objects.filter(id__in=[photo.id for photo in old_photos]).delete()

        uploaded: list[str] = []

        for photo_type, file in files_by_type.items():
            photo = PerfumePhotoModel(
                content_type=ct,
                object_id=obj.pk,
                type=photo_type,
            )
            watermarked = add_watermark_and_save(file)
            PhotoService._save_image(photo, watermarked, filename="image.jpg")
            uploaded.append(photo_type)

        PhotoService._schedule_old_files_delete(old_photos)

        return uploaded

    # =========================
    # OBJECT COVER
    # =========================

    @staticmethod
    @transaction.atomic
    def set_cover(obj, file) -> ObjectCoverModel:
        """
        РЎС‚Р°РІРёС‚/Р·Р°РјРµРЅСЏРµС‚ РѕРґРЅСѓ РѕР±Р»РѕР¶РєСѓ РѕР±СЉРµРєС‚Р°.
        """
        ct = PhotoService.content_type_for(obj)
        if not target_supports(ct, "cover"):
            raise ValueError("Target does not support a cover.")

        old_covers = list(
            ObjectCoverModel.objects
            .filter(content_type=ct, object_id=obj.pk)
            .only("id", "image")
        )

        if old_covers:
            ObjectCoverModel.objects.filter(id__in=[cover.id for cover in old_covers]).delete()

        cover = ObjectCoverModel(
            content_type=ct,
            object_id=obj.pk,
        )

        prepared = PhotoService._prepare_cover_image(obj, file)
        PhotoService._save_image(cover, prepared, filename="cover.jpg")

        PhotoService._schedule_old_files_delete(old_covers)

        return cover

    # =========================
    # OBJECT ATTACHMENTS
    # =========================

    @staticmethod
    @transaction.atomic
    def add_attachments(obj, files: list) -> list[ObjectPhotoModel]:
        ct = PhotoService.content_type_for(obj)
        if not target_supports(ct, "attachments"):
            raise ValueError("Target does not support photo attachments.")

        max_position = (
            ObjectPhotoModel.objects
            .filter(content_type=ct, object_id=obj.pk)
            .aggregate(max_position=Max("position"))
            .get("max_position")
        )

        position = int(max_position or 0)
        created: list[ObjectPhotoModel] = []

        for file in files:
            position += 1

            photo = ObjectPhotoModel(
                content_type=ct,
                object_id=obj.pk,
                position=position,
            )
            watermarked = add_watermark_and_save(file)
            PhotoService._save_image(photo, watermarked, filename="attachment.jpg")
            created.append(photo)

        return created

    @staticmethod
    @transaction.atomic
    def replace_attachments(obj, files: list) -> list[ObjectPhotoModel]:
        ct = PhotoService.content_type_for(obj)

        old_photos = list(
            ObjectPhotoModel.objects
            .filter(content_type=ct, object_id=obj.pk)
            .only("id", "image")
        )

        if old_photos:
            ObjectPhotoModel.objects.filter(id__in=[photo.id for photo in old_photos]).delete()

        created = PhotoService.add_attachments(obj, files)

        PhotoService._schedule_old_files_delete(old_photos)

        return created

    @staticmethod
    @transaction.atomic
    def delete_attachments(obj) -> None:
        ct = PhotoService.content_type_for(obj)
        photos = list(
            ObjectPhotoModel.objects
            .filter(content_type=ct, object_id=obj.pk)
            .only("id", "image")
        )

        if not photos:
            return

        ObjectPhotoModel.objects.filter(id__in=[photo.id for photo in photos]).delete()
        PhotoService._schedule_old_files_delete(photos)

    @staticmethod
    @transaction.atomic
    def add_private_attachments(obj, files: list) -> list[PrivateObjectPhotoModel]:
        ct = PhotoService.content_type_for(obj)
        policy = policy_for_content_type(ct)

        if not policy or "private_attachments" not in policy.capabilities:
            raise ValueError("Target does not support private photo attachments.")

        max_position = (
            PrivateObjectPhotoModel.objects
            .filter(content_type=ct, object_id=obj.pk)
            .aggregate(max_position=Max("position"))
            .get("max_position")
        )
        position = int(max_position or 0)
        created: list[PrivateObjectPhotoModel] = []

        for file in files:
            position += 1
            photo = PrivateObjectPhotoModel(
                content_type=ct,
                object_id=obj.pk,
                position=position,
                original_name=getattr(file, "name", "") or "",
                mime_type=getattr(file, "content_type", "") or "",
                size=getattr(file, "size", 0) or 0,
            )
            prepared = normalize_image_and_save(file)
            PhotoService._save_image(photo, prepared, filename="attachment.jpg")
            created.append(photo)

        return created

    # =========================
    # DELETE STORED PHOTO/COVER
    # =========================

    @staticmethod
    @transaction.atomic
    def delete_instance_with_file(instance) -> None:
        PhotoService._schedule_file_delete(getattr(instance, "image", None))
        instance.delete()
