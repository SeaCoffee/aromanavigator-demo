from __future__ import annotations

from django.contrib.contenttypes.models import ContentType
from django.http import FileResponse, Http404
from urllib.parse import quote
from rest_framework import status
from rest_framework.generics import CreateAPIView, DestroyAPIView, GenericAPIView
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.photos.target_registry import (
    is_object_photo_target_allowed,
    typed_perfume_model,
)
from apps.photos.permissions import CanManageStoredPhoto, can_manage_photo_target
from apps.photos.service import PhotoService
from apps.photos.selectors import build_object_photos_map
from apps.users.permissions import (
    IsAuthenticated,
    IsNotSuspended,
    IsStaffRole,
)
from core.pagination import PagePagination

from .models import (
    ObjectCoverModel,
    ObjectPhotoModel,
    PerfumePhotoModel,
    PrivateObjectPhotoModel,
)
from .serializers import (
    AttachmentsUploadSerializer,
    CoverUploadSerializer,
    ObjectCoverSerializer,
    ObjectPhotoSerializer,
    PerfumePhotoBulkUploadSerializer,
    PerfumePhotoSerializer,
    ModerationPhotoSerializer,
)


def _get_perfume_target_or_response(*, model_key: str, object_id: int, user):
    model_cls = typed_perfume_model(model_key)

    if not model_cls:
        return None, Response(
            {"detail": "РќРµРІС–РґРѕРјР° РјРѕРґРµР»СЊ."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    instance = model_cls.objects.filter(id=object_id).first()

    if not instance or not can_manage_photo_target(instance, user):
        return None, Response(
            {"detail": "РћР±КјС”РєС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ Р°Р±Рѕ РЅРµРґРѕСЃС‚Р°С‚РЅСЊРѕ РїСЂР°РІ."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return instance, None


class PerfumePhotoCreateView(CreateAPIView):
    serializer_class = PerfumePhotoSerializer
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def post(self, request, model: str, object_id: int, *args, **kwargs):
        instance, error_response = _get_perfume_target_or_response(
            model_key=model,
            object_id=object_id,
            user=request.user,
        )

        if error_response:
            return error_response

        serializer = self.get_serializer(
            data=request.data,
            context={
                **self.get_serializer_context(),
                "target": instance,
            },
        )
        serializer.is_valid(raise_exception=True)

        photo = PhotoService.replace_one(
            instance,
            serializer.validated_data["type"],
            serializer.validated_data["image"],
        )

        return Response(
            self.get_serializer(photo).data,
            status=status.HTTP_201_CREATED,
        )


class PerfumePhotoBulkCreateView(CreateAPIView):
    serializer_class = PerfumePhotoBulkUploadSerializer
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def post(self, request, model: str, object_id: int, *args, **kwargs):
        instance, error_response = _get_perfume_target_or_response(
            model_key=model,
            object_id=object_id,
            user=request.user,
        )

        if error_response:
            return error_response

        serializer = self.get_serializer(
            data=request.data,
            context={
                **self.get_serializer_context(),
                "target": instance,
            },
        )
        serializer.is_valid(raise_exception=True)

        uploaded = PhotoService.replace_bulk(instance, serializer.validated_data)

        return Response(
            {
                "detail": "Р¤РѕС‚РѕРіСЂР°С„С–С— Р·Р°РІР°РЅС‚Р°Р¶РµРЅРѕ.",
                "uploaded": uploaded,
            },
            status=status.HTTP_201_CREATED,
        )


class PerfumePhotoDeleteView(DestroyAPIView):
    queryset = PerfumePhotoModel.objects.select_related("content_type")
    permission_classes = [IsAuthenticated, IsNotSuspended, CanManageStoredPhoto]

    def delete(self, request, *args, **kwargs):
        photo = self.get_object()
        PhotoService.delete_instance_with_file(photo)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ObjectCoverSetView(CreateAPIView):
    serializer_class = CoverUploadSerializer
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        instance = serializer.validated_data["target"]

        if not can_manage_photo_target(instance, request.user):
            return Response(
                {"detail": "РћР±КјС”РєС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ Р°Р±Рѕ РЅРµРґРѕСЃС‚Р°С‚РЅСЊРѕ РїСЂР°РІ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        cover = PhotoService.set_cover(
            instance,
            serializer.validated_data["image"],
        )

        return Response(
            ObjectCoverSerializer(
                cover,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_201_CREATED,
        )


class ObjectCoverDeleteView(DestroyAPIView):
    queryset = ObjectCoverModel.objects.select_related("content_type")
    permission_classes = [IsAuthenticated, IsNotSuspended, CanManageStoredPhoto]

    def delete(self, request, *args, **kwargs):
        cover = self.get_object()
        PhotoService.delete_instance_with_file(cover)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ObjectAttachmentsAddView(CreateAPIView):
    serializer_class = AttachmentsUploadSerializer
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        instance = serializer.validated_data["target"]

        if not can_manage_photo_target(instance, request.user):
            return Response(
                {"detail": "РћР±КјС”РєС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ Р°Р±Рѕ РЅРµРґРѕСЃС‚Р°С‚РЅСЊРѕ РїСЂР°РІ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        photos = PhotoService.add_attachments(
            instance,
            serializer.validated_data["images"],
        )

        return Response(
            ObjectPhotoSerializer(
                photos,
                many=True,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_201_CREATED,
        )


class ObjectPhotoDeleteView(DestroyAPIView):
    queryset = ObjectPhotoModel.objects.select_related("content_type")
    permission_classes = [IsAuthenticated, IsNotSuspended, CanManageStoredPhoto]

    def delete(self, request, *args, **kwargs):
        photo = self.get_object()
        PhotoService.delete_instance_with_file(photo)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ObjectPhotosDetailView(GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, app_label: str, model: str, object_id: int):
        try:
            content_type = ContentType.objects.get_by_natural_key(
                app_label.lower(),
                model.lower(),
            )
        except ContentType.DoesNotExist:
            return Response(
                {"detail": "РћР±КјС”РєС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not is_object_photo_target_allowed(content_type):
            return Response(
                {"detail": "Р¦РµР№ С‚РёРї РѕР±КјС”РєС‚Р° РЅРµ РїС–РґС‚СЂРёРјСѓС”С‚СЊСЃСЏ."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        model_cls = content_type.model_class()

        if model_cls is None or not model_cls.objects.filter(pk=object_id).exists():
            return Response(
                {"detail": "РћР±КјС”РєС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        photos_map = build_object_photos_map(
            ct_id=content_type.id,
            obj_ids=[object_id],
        )
        item = photos_map.get(object_id) or {}

        return Response(
            {
                "cover": ObjectCoverSerializer(
                    item.get("cover"),
                    context=self.get_serializer_context(),
                ).data
                if item.get("cover")
                else None,
                "attachments": ObjectPhotoSerializer(
                    item.get("attachments") or [],
                    many=True,
                    context=self.get_serializer_context(),
                ).data,
            },
            status=status.HTTP_200_OK,
        )


def _photo_target_payload(photo):
    ct = photo.content_type

    return {
        "app": ct.app_label,
        "model": ct.model,
        "id": photo.object_id,
    }


def _photo_payload(photo, *, kind: str):
    return {
        "id": photo.id,
        "kind": kind,
        "image": photo.image.url if photo.image else "",
        "target": _photo_target_payload(photo),
        "created_at": photo.created_at,
        "updated_at": photo.updated_at,
    }


class ModObjectPhotoListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = ModerationPhotoSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        return ObjectPhotoModel.objects.select_related("content_type").order_by(
            "-created_at",
            "-id",
        )

    def list(self, request, *args, **kwargs):
        page = self.paginate_queryset(self.get_queryset())
        photos = list(page if page is not None else self.get_queryset())
        serializer = self.get_serializer(
            [_photo_payload(photo, kind="attachment") for photo in photos],
            many=True,
        )

        if page is not None:
            return self.get_paginated_response(serializer.data)

        return Response(serializer.data)


class ModObjectCoverListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = ModerationPhotoSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        return ObjectCoverModel.objects.select_related("content_type").order_by(
            "-created_at",
            "-id",
        )

    def list(self, request, *args, **kwargs):
        page = self.paginate_queryset(self.get_queryset())
        covers = list(page if page is not None else self.get_queryset())
        serializer = self.get_serializer(
            [_photo_payload(cover, kind="cover") for cover in covers],
            many=True,
        )

        if page is not None:
            return self.get_paginated_response(serializer.data)

        return Response(serializer.data)


def can_read_private_photo(user, photo: PrivateObjectPhotoModel) -> bool:
    target = photo.content_object

    if target is None or not user or not user.is_authenticated:
        return False

    if user.is_staff or user.is_superuser:
        return True

    return can_manage_photo_target(target, user)


class PrivateObjectPhotoFileView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        photo = (
            PrivateObjectPhotoModel.objects
            .select_related("content_type")
            .filter(pk=pk)
            .first()
        )

        if photo is None or not can_read_private_photo(request.user, photo):
            raise Http404

        try:
            file_handle = photo.image.open("rb")
        except FileNotFoundError:
            raise Http404

        filename = photo.original_name or photo.image.name.rsplit("/", 1)[-1]
        response = FileResponse(
            file_handle,
            content_type=photo.mime_type or "application/octet-stream",
        )
        response["Content-Disposition"] = f"inline; filename*=UTF-8''{quote(filename)}"
        return response
