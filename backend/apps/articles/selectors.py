from django.db.models import QuerySet
from django.shortcuts import get_object_or_404

from apps.articles.models import Article
from core.choises.article_status_choise import ArticleStatus


def articles_base_queryset() -> QuerySet[Article]:
    return (
        Article.objects
        .select_related(
            "author",
            "author__profile",
        )
        .prefetch_related("tags")
    )


def public_articles_qs() -> QuerySet[Article]:
    return articles_base_queryset().filter(status=ArticleStatus.PUBLISHED)


def my_articles_qs(user) -> QuerySet[Article]:
    return articles_base_queryset().filter(author=user)


def article_for_author(*, user, article_id: int) -> Article | None:
    return (
        articles_base_queryset()
        .filter(
            id=article_id,
            author=user,
        )
        .first()
    )


def get_article_for_author_or_404(*, user, article_id: int) -> Article:
    return get_object_or_404(
        articles_base_queryset(),
        id=article_id,
        author=user,
    )


def moderation_articles_qs() -> QuerySet[Article]:
    return articles_base_queryset().filter(
        status__in=[
            ArticleStatus.PENDING,
            ArticleStatus.PUBLISHED,
            ArticleStatus.REJECTED,
        ]
    )


def article_for_moderation(*, article_id: int) -> Article | None:
    return articles_base_queryset().filter(id=article_id).first()
