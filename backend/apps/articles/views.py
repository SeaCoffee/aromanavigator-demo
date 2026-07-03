from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import GenericAPIView, ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.articles.article_service import (
    ArticleError,
    create_article,
    create_tag,
    delete_article,
    publish_article,
    reject_article,
    submit_article,
    update_article,
)
from apps.articles.filters import ArticleFilter
from apps.articles.models import Tag
from apps.articles.selectors import (
    article_for_author,
    article_for_moderation,
    moderation_articles_qs,
    my_articles_qs,
    public_articles_qs,
)
from apps.articles.serializers import (
    ArticleCreateUpdateSerializer,
    ArticleDetailSerializer,
    ArticleListSerializer,
    ArticleRejectSerializer,
    TagSerializer,
)
from apps.users.permissions import IsAdminOrSuperuser, IsNotSuspended
from core.choises.article_status_choise import ArticleStatus
from core.pagination import PagePagination
from django.contrib.contenttypes.models import ContentType
from apps.photos.selectors import build_object_photos_map
from apps.articles.models import Article, Tag

def build_article_photos_context(view, articles):
    article_list = list(articles)

    content_type = ContentType.objects.get_for_model(
        Article,
        for_concrete_model=False,
    )

    return {
        **view.get_serializer_context(),
        "object_photos_map": build_object_photos_map(
            ct_id=content_type.id,
            obj_ids=[article.id for article in article_list],
        ),
    }


def serialize_article_list(view, queryset):
    page = view.paginate_queryset(queryset)
    articles = list(page if page is not None else queryset)

    serializer = view.get_serializer(
        articles,
        many=True,
        context=build_article_photos_context(view, articles),
    )

    if page is not None:
        return view.get_paginated_response(serializer.data)

    return Response(serializer.data)


def serialize_article_detail(view, article, serializer_class=ArticleDetailSerializer):
    return serializer_class(
        article,
        context=build_article_photos_context(view, [article]),
    ).data

class PublicArticleListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ArticleListSerializer
    pagination_class = PagePagination
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = ArticleFilter
    search_fields = [
        "title",
        "content",
        "tags__name",
        "author__profile__display_name",
    ]
    ordering_fields = [
        "created_at",
        "updated_at",
        "title",
    ]
    ordering = ["-created_at"]

    def get_queryset(self):
        return public_articles_qs()

    def list(self, request, *args, **kwargs):
        return serialize_article_list(
            self,
            self.filter_queryset(self.get_queryset()),
        )

class PublicArticleRetrieveView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ArticleDetailSerializer
    lookup_url_kwarg = "article_id"

    def get_queryset(self):
        return public_articles_qs()

    def get(self, request, article_id: int):
        article = self.get_object()

        return Response(
            serialize_article_detail(self, article),
            status=status.HTTP_200_OK,
        )


class MyArticleListCreateView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ArticleListSerializer
    pagination_class = PagePagination
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = ArticleFilter
    search_fields = [
        "title",
        "content",
        "tags__name",
    ]
    ordering_fields = [
        "created_at",
        "updated_at",
        "title",
        "status",
    ]
    ordering = ["-updated_at"]

    def get_queryset(self):
        return my_articles_qs(self.request.user)

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsNotSuspended()]

        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ArticleCreateUpdateSerializer

        return ArticleListSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        article = create_article(
            author=request.user,
            title=serializer.validated_data["title"],
            content=serializer.validated_data["content"],
            status=serializer.validated_data.get("status", ArticleStatus.DRAFT),
            tag_names=serializer.validated_data.get("tag_names"),
        )

        return Response(
            serialize_article_detail(self, article),
            status=status.HTTP_201_CREATED,
        )

    def list(self, request, *args, **kwargs):
        return serialize_article_list(
            self,
            self.filter_queryset(self.get_queryset()),
        )


class MyArticleDetailView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]
    lookup_url_kwarg = "article_id"

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return ArticleCreateUpdateSerializer

        return ArticleDetailSerializer

    def get_article(self):
        return article_for_author(
            user=self.request.user,
            article_id=self.kwargs[self.lookup_url_kwarg],
        )

    def get(self, request, article_id: int):
        article = self.get_article()

        if article is None:
            return Response(
                {"detail": "РЎС‚Р°С‚С‚СЋ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            serialize_article_detail(self, article),
            status=status.HTTP_200_OK,
        )

    def patch(self, request, article_id: int):
        article = self.get_article()

        if article is None:
            return Response(
                {"detail": "РЎС‚Р°С‚С‚СЋ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        article = update_article(
            article=article,
            title=serializer.validated_data.get("title"),
            content=serializer.validated_data.get("content"),
            status=serializer.validated_data.get("status"),
            tag_names=serializer.validated_data.get("tag_names"),
        )

        return Response(
            serialize_article_detail(self, article),
            status=status.HTTP_200_OK,
        )

    def delete(self, request, article_id: int):
        article = self.get_article()

        if article is None:
            return Response(
                {"detail": "РЎС‚Р°С‚С‚СЋ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        delete_article(article=article)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ArticleSubmitView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def post(self, request, article_id: int):
        article = article_for_author(
            user=request.user,
            article_id=article_id,
        )

        if article is None:
            return Response(
                {"detail": "РЎС‚Р°С‚С‚СЋ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        article = submit_article(article=article)

        return Response(
            serialize_article_detail(self, article),
            status=status.HTTP_200_OK,
        )


class AdminArticleModerationListView(ListAPIView):
    permission_classes = [IsAdminOrSuperuser]
    serializer_class = ArticleListSerializer
    pagination_class = PagePagination
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = ArticleFilter
    search_fields = [
        "title",
        "content",
        "tags__name",
        "author__email",
        "author__profile__display_name",
    ]
    ordering_fields = [
        "created_at",
        "updated_at",
        "title",
        "status",
    ]
    ordering = ["-updated_at"]

    def get_queryset(self):
        return moderation_articles_qs()

    def list(self, request, *args, **kwargs):
        return serialize_article_list(
            self,
            self.filter_queryset(self.get_queryset()),
        )


class ArticlePublishView(GenericAPIView):
    permission_classes = [IsAdminOrSuperuser]

    def post(self, request, article_id: int):
        article = article_for_moderation(article_id=article_id)

        if article is None:
            return Response(
                {"detail": "РЎС‚Р°С‚С‚СЋ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        article = publish_article(
            article=article,
            moderator=request.user,
        )

        return Response(
            serialize_article_detail(self, article),
            status=status.HTTP_200_OK,
        )


class ArticleRejectView(GenericAPIView):
    permission_classes = [IsAdminOrSuperuser]
    serializer_class = ArticleRejectSerializer

    def post(self, request, article_id: int):
        article = article_for_moderation(article_id=article_id)

        if article is None:
            return Response(
                {"detail": "РЎС‚Р°С‚С‚СЋ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        article = reject_article(
            article=article,
            moderator=request.user,
            moderator_comment=serializer.validated_data.get("moderator_comment", ""),
        )

        return Response(
            serialize_article_detail(self, article),
            status=status.HTTP_200_OK,
        )


class TagListCreateView(GenericAPIView):
    serializer_class = TagSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminOrSuperuser()]

        return [AllowAny()]

    def get(self, request):
        queryset = Tag.objects.all().order_by("name")

        return Response(
            TagSerializer(
                queryset,
                many=True,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            tag = create_tag(name=serializer.validated_data["name"])
        except ArticleError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            TagSerializer(
                tag,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_201_CREATED,
        )
