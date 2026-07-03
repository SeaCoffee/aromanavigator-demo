from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from PIL import Image, UnidentifiedImageError
from rest_framework import serializers

from core.validators.file_extention_validator import validate_image_extension


MAX_IMAGE_FILE_SIZE = 8 * 1024 * 1024
MAX_IMAGE_PIXELS = 25_000_000
MAX_ATTACHMENTS_PER_UPLOAD = 10


def validate_uploaded_image_file(image):
    try:
        validate_image_extension(image)
    except DjangoValidationError as exc:
        raise serializers.ValidationError(exc.messages)

    if getattr(image, "size", 0) > MAX_IMAGE_FILE_SIZE:
        raise serializers.ValidationError(
            "Р—РѕР±СЂР°Р¶РµРЅРЅСЏ РјР°С” Р±СѓС‚Рё РЅРµ Р±С–Р»СЊС€Рµ 8 РњР‘."
        )

    try:
        image.open()

        with Image.open(image) as decoded:
            width, height = decoded.size
            decoded.verify()
    except (OSError, SyntaxError, UnidentifiedImageError, ValueError):
        raise serializers.ValidationError(
            "Р—Р°РІР°РЅС‚Р°Р¶С‚Рµ РєРѕСЂРµРєС‚РЅРµ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ JPG, PNG Р°Р±Рѕ WebP."
        )
    finally:
        try:
            image.seek(0)
        except (AttributeError, OSError):
            pass

    if width <= 0 or height <= 0 or width * height > MAX_IMAGE_PIXELS:
        raise serializers.ValidationError(
            "Р РѕР·РґС–Р»СЊРЅР° Р·РґР°С‚РЅС–СЃС‚СЊ Р·РѕР±СЂР°Р¶РµРЅРЅСЏ Р·Р°РІРµР»РёРєР°. РњР°РєСЃРёРјСѓРј 25 РјРµРіР°РїС–РєСЃРµР»С–РІ."
        )

    return image


def validate_uploaded_image_files(images):
    if not images:
        raise serializers.ValidationError(
            "Р—Р°РІР°РЅС‚Р°Р¶С‚Рµ С‰РѕРЅР°Р№РјРµРЅС€Рµ РѕРґРЅРµ С„РѕС‚Рѕ."
        )

    if len(images) > MAX_ATTACHMENTS_PER_UPLOAD:
        raise serializers.ValidationError(
            "Р—Р° РѕРґРёРЅ СЂР°Р· РјРѕР¶РЅР° Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё РЅРµ Р±С–Р»СЊС€Рµ 10 Р·РѕР±СЂР°Р¶РµРЅСЊ."
        )

    for image in images:
        validate_uploaded_image_file(image)

    return images
