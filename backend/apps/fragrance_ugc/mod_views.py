from __future__ import annotations

from rest_framework import status
from rest_framework.generics import UpdateAPIView, GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.permissions import IsNotSuspended, IsStaffRole
from apps.fragrance_ugc.models import FragranceAddRequestModel
from apps.fragrance_ugc.mod_service import FragranceUGCModService



from apps.fragrance_ugc.mod_service import FragranceUGCModService
from apps.fragrance_ugc.serializers import (
    AttachCreatedFragranceSerializer,
    FragranceAddRequestSerializer,
    FragranceAddRequestStaffUpdateSerializer,
    ModerationStatusInputSerializer,
    FragranceAddRequestCreateFragranceApproveSerializer

)


class ModNoteSuggestionSetStatusView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = ModerationStatusInputSerializer

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        obj = FragranceUGCModService.set_note_suggestion_status(
            suggestion_id=int(kwargs["pk"]),
            status=serializer.validated_data["status"],
            moderator_comment=serializer.validated_data.get("moderator_comment", ""),
        )

        return Response(
            {"ok": True, "id": obj.id, "status": obj.status},
            status=status.HTTP_200_OK,
        )


class ModSimilaritySuggestionSetStatusView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = ModerationStatusInputSerializer

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        obj = FragranceUGCModService.set_similarity_suggestion_status(
            suggestion_id=int(kwargs["pk"]),
            status=serializer.validated_data["status"],
            moderator_comment=serializer.validated_data.get("moderator_comment", ""),
        )

        return Response(
            {"ok": True, "id": obj.id, "status": obj.status},
            status=status.HTTP_200_OK,
        )


class ModAddRequestSetStatusView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = ModerationStatusInputSerializer

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        obj = FragranceUGCModService.set_add_request_status(
            request_id=int(kwargs["pk"]),
            moderator=request.user,
            status=serializer.validated_data["status"],
            moderator_comment=serializer.validated_data.get("moderator_comment", ""),
        )

        return Response(
            {"ok": True, "id": obj.id, "status": obj.status},
            status=status.HTTP_200_OK,
        )


class ModAddRequestUpdateView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = FragranceAddRequestStaffUpdateSerializer

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        obj = FragranceUGCModService.update_add_request(
            request_id=int(kwargs["pk"]),
            **serializer.validated_data,
        )

        return Response(
            FragranceAddRequestSerializer(
                obj,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )


class ModAddRequestAttachFragranceView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = AttachCreatedFragranceSerializer

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        obj = FragranceUGCModService.attach_created_fragrance(
            request_id=int(kwargs["pk"]),
            moderator=request.user,
            fragrance_id=serializer.validated_data["fragrance_id"],
            moderator_comment=serializer.validated_data.get("moderator_comment", ""),
        )

        return Response(
            FragranceAddRequestSerializer(
                obj,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )


class ModAddRequestApproveWithFragranceView(UpdateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = AttachCreatedFragranceSerializer

    def patch(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        obj = FragranceUGCModService.approve_add_request_with_fragrance(
            request_id=int(kwargs["pk"]),
            moderator=request.user,
            fragrance_id=serializer.validated_data["fragrance_id"],
            moderator_comment=serializer.validated_data.get("moderator_comment", ""),
        )

        return Response(
            FragranceAddRequestSerializer(
                obj,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )

class ModAddRequestCreateFragranceApproveView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = FragranceAddRequestCreateFragranceApproveSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        req = FragranceUGCModService.create_fragrance_from_add_request_and_approve(
            request_id=int(kwargs["pk"]),
            moderator=request.user,
            brand_id=serializer.validated_data["brand_id"],
            name=serializer.validated_data["name"],
            slug=serializer.validated_data.get("slug", ""),
            release_year=serializer.validated_data.get("release_year"),
            perfumer_ids=serializer.validated_data.get("perfumer_ids", []),
            family_ids=serializer.validated_data.get("family_ids", []),
            top_note_ids=serializer.validated_data.get("top_note_ids", []),
            heart_note_ids=serializer.validated_data.get("heart_note_ids", []),
            base_note_ids=serializer.validated_data.get("base_note_ids", []),
            moderator_comment=serializer.validated_data.get("moderator_comment", ""),
        )

        req = FragranceAddRequestModel.objects.with_relations().get(id=req.id)

        return Response(
            FragranceAddRequestSerializer(
                req,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_201_CREATED,
        )
