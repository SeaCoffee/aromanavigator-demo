from __future__ import annotations

from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.users.permissions import IsNotSuspended, IsStaffRole
from core.pagination import PagePagination

from apps.fragrance_ugc.fragrance_ugc_service import FragranceUGCService
from apps.fragrance_ugc.models import (
    FragranceAddRequestModel,
    FragranceSimilaritySuggestionModel,
    UserFragranceNoteSuggestionModel,
)
from apps.fragrance_ugc.serializers import (
    FragranceAddRequestCreateSerializer,
    FragranceAddRequestSerializer,
    FragranceSimilaritySuggestionCreateSerializer,
    FragranceSimilaritySuggestionSerializer,
    FragranceSimilarityVoteSerializer,
    UserFragranceNoteSuggestionCreateSerializer,
    UserFragranceNoteSuggestionSerializer,
    UserFragranceNoteVoteSerializer,
)


class AdminFragranceAddRequestDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = FragranceAddRequestSerializer
    lookup_field = "pk"

    def get_queryset(self):
        return FragranceAddRequestModel.objects.with_relations()

class NoteSuggestionCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = UserFragranceNoteSuggestionCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        suggestion = FragranceUGCService.create_note_suggestion(
            user=request.user,
            fragrance_id=int(kwargs["fragrance_id"]),
            note_id=serializer.validated_data["note_id"],
            level=serializer.validated_data.get("level", "top"),
        )

        suggestion = (
            UserFragranceNoteSuggestionModel.objects.with_relations()
            .with_score()
            .get(id=suggestion.id)
        )

        return Response(
            UserFragranceNoteSuggestionSerializer(
                suggestion,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_201_CREATED,
        )


class NoteSuggestionListByFragranceView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserFragranceNoteSuggestionSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        return (
            UserFragranceNoteSuggestionModel.objects.with_relations()
            .for_fragrance(self.kwargs["fragrance_id"])
            .with_score()
            .with_level(self.request.query_params.get("level"))
            .with_public_status(self.request.query_params.get("status"))
            .safe_order(self.request.query_params.get("ordering"))
        )


class AdminNoteSuggestionsView(ListAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = UserFragranceNoteSuggestionSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        return (
            UserFragranceNoteSuggestionModel.objects.with_relations()
            .with_score()
            .with_level(self.request.query_params.get("level"))
            .with_admin_status(self.request.query_params.get("status"))
            .safe_order(self.request.query_params.get("ordering"))
        )


class NoteVoteCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = UserFragranceNoteVoteSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vote = FragranceUGCService.vote_note_suggestion(
            user=request.user,
            suggestion_id=int(kwargs["suggestion_id"]),
            value=serializer.validated_data["value"],
        )

        return Response(
            {"ok": True, "vote_id": vote.id, "value": vote.value},
            status=status.HTTP_201_CREATED,
        )


class SimilaritySuggestionCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = FragranceSimilaritySuggestionCreateSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["fragrance_id"] = int(self.kwargs["fragrance_id"])
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        suggestion = FragranceUGCService.create_similarity_suggestion(
            user=request.user,
            fragrance_id=int(kwargs["fragrance_id"]),
            similar_fragrance_id=serializer.validated_data["similar_fragrance_id"],
        )

        suggestion = (
            FragranceSimilaritySuggestionModel.objects.with_relations()
            .with_score()
            .get(id=suggestion.id)
        )

        return Response(
            FragranceSimilaritySuggestionSerializer(
                suggestion,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_201_CREATED,
        )


class SimilaritySuggestionListByFragranceView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = FragranceSimilaritySuggestionSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        return (
            FragranceSimilaritySuggestionModel.objects.with_relations()
            .for_fragrance(self.kwargs["fragrance_id"])
            .with_score()
            .with_public_status(self.request.query_params.get("status"))
            .safe_order(self.request.query_params.get("ordering"))
        )


class AdminSimilaritySuggestionsView(ListAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = FragranceSimilaritySuggestionSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        return (
            FragranceSimilaritySuggestionModel.objects.with_relations()
            .with_score()
            .with_admin_status(self.request.query_params.get("status"))
            .safe_order(self.request.query_params.get("ordering"))
        )


class SimilarityVoteCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = FragranceSimilarityVoteSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vote = FragranceUGCService.vote_similarity_suggestion(
            user=request.user,
            suggestion_id=int(kwargs["suggestion_id"]),
            value=serializer.validated_data["value"],
        )

        return Response(
            {"ok": True, "vote_id": vote.id, "value": vote.value},
            status=status.HTTP_201_CREATED,
        )


class FragranceAddRequestCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = FragranceAddRequestCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        req = FragranceUGCService.create_add_request(
            user=request.user,
            payload=serializer.validated_data,
        )

        req = FragranceAddRequestModel.objects.with_relations().get(id=req.id)

        return Response(
            FragranceAddRequestSerializer(
                req,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_201_CREATED,
        )


class MyFragranceAddRequestsView(ListAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    serializer_class = FragranceAddRequestSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        return (
            FragranceAddRequestModel.objects.with_relations()
            .for_user(self.request.user)
            .with_status(self.request.query_params.get("status"))
            .search(self.request.query_params.get("q"))
            .safe_order(self.request.query_params.get("ordering"))
        )


class AdminFragranceAddRequestsView(ListAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = FragranceAddRequestSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        return (
            FragranceAddRequestModel.objects.with_relations()
            .with_status(self.request.query_params.get("status"))
            .search(self.request.query_params.get("q"))
            .safe_order(self.request.query_params.get("ordering"))
        )
