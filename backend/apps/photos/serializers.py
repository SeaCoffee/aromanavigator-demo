from __future__ import annotations

from rest_framework import serializers

from apps.photos.target_registry import (
    is_object_attachment_target_allowed,
    is_object_cover_target_allowed,
)
from core.serializers.target_reference import TargetReferenceField

from .models import (
    ObjectCoverModel,
    ObjectPhotoModel,
    PerfumePhotoModel,
    PrivateObjectPhotoModel,
)
from core.validators.photos_validators import (
    MAX_ATTACHMENTS_PER_UPLOAD,
    validate_uploaded_image_file,
)




class PerfumePhotoSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(validators=[validate_uploaded_image_file])

    class Meta:
        model = PerfumePhotoModel
        fields = ["id", "type", "image", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class PerfumePhotoBulkUploadSerializer(serializers.Serializer):
    full = serializers.ImageField(required=False, validators=[validate_uploaded_image_file])
    bottom = serializers.ImageField(required=False, validators=[validate_uploaded_image_file])
    laser = serializers.ImageField(required=False, validators=[validate_uploaded_image_file])
    sprayer = serializers.ImageField(required=False, validators=[validate_uploaded_image_file])

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Р—Р°РІР°РЅС‚Р°Р¶С‚Рµ С‰РѕРЅР°Р№РјРµРЅС€Рµ РѕРґРЅРµ С„РѕС‚Рѕ.")

        return attrs


class TypedPerfumePhotoInputSerializer(serializers.Serializer):
    full = serializers.ImageField(required=False, validators=[validate_uploaded_image_file])
    bottom = serializers.ImageField(required=False, validators=[validate_uploaded_image_file])
    laser = serializers.ImageField(required=False, validators=[validate_uploaded_image_file])
    sprayer = serializers.ImageField(required=False, validators=[validate_uploaded_image_file])

    def split_photo_payload(self) -> tuple[dict, dict]:
        validated = dict(self.validated_data)
        photo_files = {
            key: validated.pop(key)
            for key in ("full", "bottom", "laser", "sprayer")
            if key in validated and validated[key] is not None
        }
        return validated, photo_files


class ObjectPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjectPhotoModel
        fields = ["id", "position", "image", "created_at", "updated_at"]
        read_only_fields = ["id", "position", "created_at", "updated_at"]


class ObjectCoverSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjectCoverModel
        fields = ["id", "image", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class PrivateObjectPhotoSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    content_type = serializers.CharField(source="mime_type", read_only=True)

    class Meta:
        model = PrivateObjectPhotoModel
        fields = [
            "id",
            "url",
            "original_name",
            "content_type",
            "size",
            "created_at",
        ]
        read_only_fields = fields

    def get_url(self, obj) -> str:
        from django.urls import reverse

        path = reverse("photos:private-object-photo-file", kwargs={"pk": obj.pk})
        request = self.context.get("request")
        return request.build_absolute_uri(path) if request else path


class ModerationPhotoSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    kind = serializers.CharField()
    image = serializers.CharField()
    target = serializers.DictField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()


class CoverUploadSerializer(serializers.Serializer):
    target = TargetReferenceField(allow_ct=is_object_cover_target_allowed)
    image = serializers.ImageField(required=True, validators=[validate_uploaded_image_file])


class AttachmentsUploadSerializer(serializers.Serializer):
    target = TargetReferenceField(allow_ct=is_object_attachment_target_allowed)
    images = serializers.ListField(
        child=serializers.ImageField(validators=[validate_uploaded_image_file]),
        allow_empty=False,
        min_length=1,
        max_length=MAX_ATTACHMENTS_PER_UPLOAD,
    )
