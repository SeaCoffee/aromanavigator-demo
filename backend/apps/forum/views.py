from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.forum.forum_service import ForumSectionWriteService, ForumWriteService, UNSET
from apps.forum.models import ForumSectionModel, ForumTopicModel
from apps.forum.selectors import (
    build_section_serializer_context,
    build_topic_serializer_context,
    section_queryset,
    topic_list_queryset,
    topic_queryset,
)
from apps.forum.serializers import ForumSectionSerializer, ForumTopicSerializer
from apps.users.permissions import IsNotSuspendedOrReadOnly, IsOwnerOrStaff, IsStaffRole


def raise_drf_validation_error(exc: DjangoValidationError):
    if hasattr(exc, "message_dict"):
        raise DRFValidationError(exc.message_dict)

    raise DRFValidationError(exc.messages)


def _response_results(response: Response):
    if isinstance(response.data, dict):
        return response.data.get("results") or []

    return response.data or []


def _replace_response_results(response: Response, data) -> Response:
    if isinstance(response.data, dict):
        response.data["results"] = data
    else:
        response.data = data

    return response


def _ordered_by_ids(qs, ids: list[int]):
    ordering_map = {
        obj_id: index
        for index, obj_id in enumerate(ids)
    }

    return sorted(
        list(qs.filter(id__in=ids)),
        key=lambda obj: ordering_map.get(obj.id, 10**9),
    )


class ForumSectionListCreateView(ListCreateAPIView):
    serializer_class = ForumSectionSerializer
    filter_backends = [OrderingFilter, SearchFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["order", "created_at", "title"]
    ordering = ["order", "title"]

    def get_queryset(self):
        return section_queryset(user=self.request.user)

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsStaffRole()]

        return [AllowAny()]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        results = _response_results(response)

        section_ids = [
            int(item["id"])
            for item in results
            if isinstance(item, dict) and item.get("id")
        ]

        if not section_ids:
            return response

        objects = _ordered_by_ids(self.get_queryset(), section_ids)

        serializer = self.get_serializer(
            objects,
            many=True,
            context={
                **self.get_serializer_context(),
                **build_section_serializer_context(section_ids=section_ids),
            },
        )

        return _replace_response_results(response, serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        section = ForumSectionWriteService().create_section(
            title=serializer.validated_data["title"],
            description=serializer.validated_data.get("description", ""),
            is_active=serializer.validated_data.get("is_active", True),
            order=serializer.validated_data.get("order", 0),
        )

        response_serializer = self.get_serializer(
            section,
            context={
                **self.get_serializer_context(),
                **build_section_serializer_context(section_ids=[section.id]),
            },
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )


class ForumSectionRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = ForumSectionSerializer

    def get_queryset(self):
        return section_queryset(user=self.request.user)

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [IsAuthenticated(), IsStaffRole()]

        return [AllowAny()]

    def retrieve(self, request, *args, **kwargs):
        section = self.get_object()

        serializer = self.get_serializer(
            section,
            context={
                **self.get_serializer_context(),
                **build_section_serializer_context(section_ids=[section.id]),
            },
        )

        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        section = self.get_object()

        serializer = self.get_serializer(
            section,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)

        updated = ForumSectionWriteService().update_section(
            section=section,
            title=serializer.validated_data.get("title"),
            description=serializer.validated_data.get("description"),
            is_active=serializer.validated_data.get("is_active"),
            order=serializer.validated_data.get("order"),
        )

        response_serializer = self.get_serializer(
            updated,
            context={
                **self.get_serializer_context(),
                **build_section_serializer_context(section_ids=[updated.id]),
            },
        )

        return Response(response_serializer.data)

    def perform_destroy(self, instance: ForumSectionModel):
        ForumSectionWriteService().deactivate_section(section=instance)


class ForumTopicListCreateView(ListCreateAPIView):
    serializer_class = ForumTopicSerializer
    filter_backends = [OrderingFilter, SearchFilter]
    search_fields = [
        "title",
        "content",
        "author__email",
        "author__profile__display_name",
    ]
    ordering_fields = [
        "created_at",
        "updated_at",
        "last_activity_at",
        "likes_count",
        "comments_count",
        "views_count",
    ]
    ordering = ["-is_pinned", "-last_activity_at", "-created_at"]

    def get_queryset(self):
        return topic_list_queryset(
            user=self.request.user,
            section=self.request.query_params.get("section"),
            tag=self.request.query_params.get("tag"),
        )

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsNotSuspendedOrReadOnly()]

        return [AllowAny()]

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        results = _response_results(response)

        topic_ids = [
            int(item["id"])
            for item in results
            if isinstance(item, dict) and item.get("id")
        ]

        if not topic_ids:
            return response

        objects = _ordered_by_ids(self.get_queryset(), topic_ids)

        serializer = self.get_serializer(
            objects,
            many=True,
            context={
                **self.get_serializer_context(),
                **build_topic_serializer_context(
                    user=request.user,
                    topic_ids=topic_ids,
                ),
            },
        )

        return _replace_response_results(response, serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            validated_data = dict(serializer.validated_data)
            extra_tags = validated_data.pop("tags", None)

            topic = ForumWriteService().create_topic(
                author=request.user,
                extra_tags=extra_tags,
                **validated_data,
            )
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)

        response_serializer = self.get_serializer(
            topic,
            context={
                **self.get_serializer_context(),
                **build_topic_serializer_context(
                    user=request.user,
                    topic_ids=[topic.id],
                ),
            },
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )


class ForumTopicRetrieveUpdateDestroyView(RetrieveUpdateDestroyAPIView):
    serializer_class = ForumTopicSerializer

    def get_queryset(self):
        return topic_queryset(user=self.request.user)

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH", "DELETE"):
            return [IsAuthenticated(), IsNotSuspendedOrReadOnly(), IsOwnerOrStaff()]

        return [AllowAny()]

    def retrieve(self, request, *args, **kwargs):
        topic = self.get_object()

        ForumTopicModel.objects.increment_views(topic.id)
        topic.refresh_from_db(fields=["views_count"])

        serializer = self.get_serializer(
            topic,
            context={
                **self.get_serializer_context(),
                **build_topic_serializer_context(
                    user=request.user,
                    topic_ids=[topic.id],
                ),
            },
        )

        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        topic = self.get_object()

        serializer = self.get_serializer(
            topic,
            data=request.data,
            partial=partial,
        )
        serializer.is_valid(raise_exception=True)

        validated_data = dict(serializer.validated_data)

        if "tags" in validated_data:
            extra_tags = validated_data.pop("tags")
        else:
            extra_tags = UNSET

        try:
            updated = ForumWriteService().update_topic(
                topic=topic,
                extra_tags=extra_tags,
                **validated_data,
            )
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)

        response_serializer = self.get_serializer(
            updated,
            context={
                **self.get_serializer_context(),
                **build_topic_serializer_context(
                    user=request.user,
                    topic_ids=[updated.id],
                ),
            },
        )

        return Response(response_serializer.data)

    def perform_destroy(self, instance: ForumTopicModel):
        ForumWriteService().soft_delete_topic(topic=instance)
