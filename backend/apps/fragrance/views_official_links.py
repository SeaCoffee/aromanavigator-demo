from __future__ import annotations

from rest_framework import status
from rest_framework.generics import CreateAPIView, DestroyAPIView, GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.permissions import IsNotSuspended, IsStaffRole

from .fragrance_service import FragranceService
from .serializers import (
    OfficialFamilyInputSerializer,
    OfficialNoteInputSerializer,
    OfficialNoteMetaInputSerializer,
    OfficialPerfumerInputSerializer,
)


class OfficialPerfumerAddView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = OfficialPerfumerInputSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        FragranceService.add_official_perfumer(
            fragrance_id=int(kwargs["fragrance_id"]),
            perfumer_id=serializer.validated_data["perfumer_id"],
        )

        return Response({"ok": True}, status=status.HTTP_201_CREATED)


class OfficialPerfumerRemoveView(DestroyAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]

    def delete(self, request, *args, **kwargs):
        FragranceService.remove_official_perfumer(
            fragrance_id=int(kwargs["fragrance_id"]),
            perfumer_id=int(kwargs["perfumer_id"]),
        )

        return Response(status=status.HTTP_204_NO_CONTENT)


class OfficialFamilyAddView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = OfficialFamilyInputSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        FragranceService.add_official_family(
            fragrance_id=int(kwargs["fragrance_id"]),
            family_id=serializer.validated_data["family_id"],
        )

        return Response({"ok": True}, status=status.HTTP_201_CREATED)


class OfficialFamilyRemoveView(DestroyAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]

    def delete(self, request, *args, **kwargs):
        FragranceService.remove_official_family(
            fragrance_id=int(kwargs["fragrance_id"]),
            family_id=int(kwargs["family_id"]),
        )

        return Response(status=status.HTTP_204_NO_CONTENT)


class OfficialNoteAddView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = OfficialNoteInputSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        FragranceService.add_official_note(
            fragrance_id=int(kwargs["fragrance_id"]),
            note_id=serializer.validated_data["note_id"],
            position=serializer.validated_data.get("position", 0),
            level=serializer.validated_data.get("level", "top"),
        )

        return Response({"ok": True}, status=status.HTTP_201_CREATED)


class OfficialNoteMetaUpdateView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = OfficialNoteMetaInputSerializer

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        FragranceService.update_official_note_meta(
            fragrance_id=int(kwargs["fragrance_id"]),
            note_id=int(kwargs["note_id"]),
            current_level=str(kwargs["level"]),
            position=serializer.validated_data.get("position"),
            new_level=serializer.validated_data.get("level"),
        )

        return Response({"ok": True}, status=status.HTTP_200_OK)


class OfficialNoteRemoveView(DestroyAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]

    def delete(self, request, *args, **kwargs):
        FragranceService.remove_official_note(
            fragrance_id=int(kwargs["fragrance_id"]),
            note_id=int(kwargs["note_id"]),
            level=str(kwargs["level"]),
        )

        return Response(status=status.HTTP_204_NO_CONTENT)
