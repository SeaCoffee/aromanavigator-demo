from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import status
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework.generics import (
    ListAPIView,
    ListCreateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.comments.comment_service import CommentService
from apps.comments.models import CommentModel
from apps.comments.selectors import (
    attach_replies_tree,
    build_comment_serializer_context,
    flatten_thread_comment_ids,
    resolve_comment_target_params,
    target_comments_queryset,
    target_top_level_comments_queryset,
)
from apps.comments.serializers import (
    CommentCreateSerializer,
    CommentSerializer,
    CommentThreadSerializer,
    CommentUpdateSerializer,
)
from apps.users.permissions import IsCommentOwnerOrStaff, IsNotSuspended
from apps.users.permissions import IsStaffRole
from apps.photos.service import PhotoService
from core.pagination import PagePagination


def raise_drf_validation_error(exc: DjangoValidationError):
    if hasattr(exc, "message_dict"):
        raise DRFValidationError(exc.message_dict)

    raise DRFValidationError(exc.messages)


class CommentListCreateView(ListCreateAPIView):
    pagination_class = PagePagination

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsNotSuspended()]

        return [AllowAny()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CommentCreateSerializer

        return CommentSerializer

    def get_queryset(self):
        target_params = resolve_comment_target_params(
            app=self.request.query_params.get("app"),
            model=self.request.query_params.get("model"),
            object_id=self.request.query_params.get("id"),
        )

        if not target_params:
            return CommentModel.objects.none()

        content_type, object_id = target_params

        return target_comments_queryset(
            content_type=content_type,
            object_id=object_id,
            include_deleted=False,
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        objects = list(page if page is not None else queryset)

        comment_ids = [comment.id for comment in objects]

        serializer = self.get_serializer(
            objects,
            many=True,
            context={
                **self.get_serializer_context(),
                **build_comment_serializer_context(
                    user=request.user,
                    comment_ids=comment_ids,
                    include_photos=True,
                ),
            },
        )

        if page is not None:
            return self.get_paginated_response(serializer.data)

        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                comment = CommentService.create_comment(
                    user=request.user,
                    target=serializer.validated_data["target"],
                    body=serializer.validated_data["body"],
                    parent=serializer.validated_data.get("parent"),
                    is_official=serializer.validated_data.get("is_official", False),
                )
                PhotoService.add_attachments(
                    comment,
                    serializer.validated_data.get("images") or [],
                )
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)

        response_serializer = CommentSerializer(
            comment,
            context={
                **self.get_serializer_context(),
                **build_comment_serializer_context(
                    user=request.user,
                    comment_ids=[comment.id],
                    include_photos=True,
                ),
            },
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
        )


class ModCommentListView(ListAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended, IsStaffRole]
    serializer_class = CommentSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        queryset = (
            CommentModel.objects
            .select_related("content_type", "user", "user__profile", "parent")
            .order_by("-created_at", "-id")
        )

        q = (self.request.query_params.get("q") or "").strip()
        include_deleted = self.request.query_params.get("include_deleted")

        if include_deleted not in {"1", "true"}:
            queryset = queryset.filter(is_deleted=False)

        if q:
            queryset = queryset.filter(body__icontains=q)

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        comments = list(page if page is not None else queryset)
        serializer = self.get_serializer(
            comments,
            many=True,
            context={
                **self.get_serializer_context(),
                **build_comment_serializer_context(
                    user=request.user,
                    comment_ids=[comment.id for comment in comments],
                    include_photos=True,
                ),
            },
        )

        if page is not None:
            return self.get_paginated_response(serializer.data)

        return Response(serializer.data)

class CommentDetailView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsCommentOwnerOrStaff]

    def get_queryset(self):
        return (
            CommentModel.objects
            .select_related("content_type", "user", "user__profile", "parent")
        )

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return CommentUpdateSerializer

        return CommentSerializer

    def patch(self, request, *args, **kwargs):
        comment = self.get_object()
        self.check_object_permissions(request, comment)

        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            updated = CommentService.update_comment(
                comment=comment,
                body=serializer.validated_data["body"],
                actor=request.user,
            )
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)

        response_serializer = CommentSerializer(
            updated,
            context={
                **self.get_serializer_context(),
                **build_comment_serializer_context(
                    user=request.user,
                    comment_ids=[updated.id],
                    include_photos=True,
                ),
            },
        )

        return Response(response_serializer.data)

    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        self.check_object_permissions(request, comment)

        CommentService.soft_delete_comment(comment=comment)

        return Response(status=status.HTTP_204_NO_CONTENT)


class CommentThreadByTargetView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CommentThreadSerializer
    pagination_class = PagePagination

    def get_target_params(self):
        return resolve_comment_target_params(
            app=self.request.query_params.get("app"),
            model=self.request.query_params.get("model"),
            object_id=self.request.query_params.get("id"),
        )

    def get_queryset(self):
        target_params = self.get_target_params()

        if not target_params:
            return CommentModel.objects.none()

        content_type, object_id = target_params

        return target_top_level_comments_queryset(
            content_type=content_type,
            object_id=object_id,
        )

    def list(self, request, *args, **kwargs):
        target_params = self.get_target_params()

        if not target_params:
            return self.get_paginated_response([])

        content_type, object_id = target_params

        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        top_comments = list(page if page is not None else queryset)

        attach_replies_tree(
            top_comments=top_comments,
            content_type=content_type,
            object_id=object_id,
        )

        all_comment_ids = flatten_thread_comment_ids(top_comments)

        serializer = self.get_serializer(
            top_comments,
            many=True,
            context={
                **self.get_serializer_context(),
                **build_comment_serializer_context(
                    user=request.user,
                    comment_ids=all_comment_ids,
                    include_photos=True,
                ),
            },
        )

        if page is not None:
            return self.get_paginated_response(serializer.data)

        return Response(serializer.data)
