from django.urls import path

from apps.articles.views import (
    AdminArticleModerationListView,
    ArticlePublishView,
    ArticleRejectView,
    ArticleSubmitView,
    MyArticleDetailView,
    MyArticleListCreateView,
    PublicArticleListView,
    PublicArticleRetrieveView,
    TagListCreateView,
)



urlpatterns = [
    path("", PublicArticleListView.as_view(), name="article-public-list"),
    path("<int:article_id>", PublicArticleRetrieveView.as_view(), name="article-public-detail"),

    path("me", MyArticleListCreateView.as_view(), name="article-me-list"),
    path("me/<int:article_id>", MyArticleDetailView.as_view(), name="article-me-detail"),
    path("me/<int:article_id>/submit", ArticleSubmitView.as_view(), name="article-submit"),

    path("admin/moderation", AdminArticleModerationListView.as_view(), name="article-admin-moderation"),
    path("admin/<int:article_id>/publish", ArticlePublishView.as_view(), name="article-admin-publish"),
    path("admin/<int:article_id>/reject", ArticleRejectView.as_view(), name="article-admin-reject"),

    path("tags", TagListCreateView.as_view(), name="article-tag-list"),
]
