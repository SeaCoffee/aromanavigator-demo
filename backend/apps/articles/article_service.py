from collections.abc import Iterable

from django.db import IntegrityError
from django.db.transaction import atomic

from apps.articles.activity import (
    publish_article_created_activity,
    publish_article_updated_activity,
)
from apps.articles.models import Article, Tag
from core.validators.article_validators import (
    validate_article_content,
    validate_article_title,
    validate_author_article_status,
    validate_moderator_comment,
    validate_tag_names,
)
from apps.notifications.notifications_service import NotificationsService
from core.choises.article_status_choise import ArticleStatus


class ArticleError(Exception):
    pass


def normalize_tag_name(name: str) -> str:
    return " ".join(str(name or "").split()).strip()


def get_or_create_tags_by_names(names: Iterable[str]) -> list[Tag]:
    clean_names = validate_tag_names(list(names))

    if not clean_names:
        return []

    existing = {
        tag.name.casefold(): tag
        for tag in Tag.objects.filter(name__in=clean_names)
    }

    missing_names = [
        name
        for name in clean_names
        if name.casefold() not in existing
    ]

    if missing_names:
        Tag.objects.bulk_create(
            [Tag(name=name) for name in missing_names],
            ignore_conflicts=True,
        )

        existing = {
            tag.name.casefold(): tag
            for tag in Tag.objects.filter(name__in=clean_names)
        }

    return [
        existing[name.casefold()]
        for name in clean_names
        if name.casefold() in existing
    ]


def refresh_article(article: Article) -> Article:
    return (
        Article.objects
        .select_related(
            "author",
            "author__profile",
        )
        .prefetch_related("tags")
        .get(id=article.id)
    )


@atomic
def create_article(
    *,
    author,
    title: str,
    content: str,
    status: str = ArticleStatus.DRAFT,
    tag_names: list[str] | None = None,
) -> Article:
    clean_status = validate_author_article_status(status)

    article = Article.objects.create(
        author=author,
        title=validate_article_title(title),
        content=validate_article_content(content),
        status=clean_status,
        moderator_comment="",
    )

    if tag_names is not None:
        article.tags.set(get_or_create_tags_by_names(tag_names))

    return refresh_article(article)


@atomic
def update_article(
    *,
    article: Article,
    title: str | None = None,
    content: str | None = None,
    status: str | None = None,
    tag_names: list[str] | None = None,
) -> Article:
    changed_fields: list[str] = []

    if title is not None:
        clean_title = validate_article_title(title)

        if article.title != clean_title:
            article.title = clean_title
            changed_fields.append("title")

    if content is not None:
        clean_content = validate_article_content(content)

        if article.content != clean_content:
            article.content = clean_content
            changed_fields.append("content")

    if status is not None:
        clean_status = validate_author_article_status(status)

        if article.status != clean_status:
            article.status = clean_status
            changed_fields.append("status")

            if clean_status != ArticleStatus.REJECTED:
                article.moderator_comment = ""
                changed_fields.append("moderator_comment")

    if changed_fields:
        article.save(update_fields=[*changed_fields, "updated_at"])

    tags_changed = False

    if tag_names is not None:
        article.tags.set(get_or_create_tags_by_names(tag_names))
        tags_changed = True

    article = refresh_article(article)

    if article.status == ArticleStatus.PUBLISHED and (
        changed_fields or tags_changed
    ):
        publish_article_updated_activity(article=article)

    return article


@atomic
def submit_article(*, article: Article) -> Article:
    if article.status == ArticleStatus.PENDING:
        return refresh_article(article)

    article.status = ArticleStatus.PENDING
    article.moderator_comment = ""
    article.save(update_fields=["status", "moderator_comment", "updated_at"])

    return refresh_article(article)


@atomic
def publish_article(*, article: Article, moderator) -> Article:
    was_published = article.status == ArticleStatus.PUBLISHED

    article.status = ArticleStatus.PUBLISHED
    article.moderator_comment = ""
    article.save(update_fields=["status", "moderator_comment", "updated_at"])

    article = refresh_article(article)

    if was_published:
        publish_article_updated_activity(article=article)
    else:
        publish_article_created_activity(article=article)

    NotificationsService.notify(
        user_id=article.author_id,
        verb="article_published",
        actor_obj=moderator,
        target_obj=article,
        inc_unread=True,
    )

    return article


@atomic
def reject_article(
    *,
    article: Article,
    moderator,
    moderator_comment: str = "",
) -> Article:
    article.status = ArticleStatus.REJECTED
    article.moderator_comment = validate_moderator_comment(moderator_comment)
    article.save(update_fields=["status", "moderator_comment", "updated_at"])

    article = refresh_article(article)

    NotificationsService.notify(
        user_id=article.author_id,
        verb="article_rejected",
        actor_obj=moderator,
        target_obj=article,
        inc_unread=True,
    )

    return article


@atomic
def delete_article(*, article: Article) -> None:
    article.delete()


@atomic
def create_tag(*, name: str) -> Tag:
    clean_name = normalize_tag_name(name)

    if not clean_name:
        raise ArticleError("Р’РєР°Р¶С–С‚СЊ РЅР°Р·РІСѓ С‚РµРіСѓ.")

    try:
        tag, _ = Tag.objects.get_or_create(name=clean_name)
    except IntegrityError:
        tag = Tag.objects.filter(name__iexact=clean_name).first()

        if tag is None:
            raise ArticleError("РќРµ РІРґР°Р»РѕСЃСЏ СЃС‚РІРѕСЂРёС‚Рё С‚РµРі.")

    return tag
