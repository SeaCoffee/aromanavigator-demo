import logging

from apps.activity.adapters import get_activity_service
from apps.articles.models import Article
from core.choises.activity_choises import ActivityVerb
from core.choises.article_status_choise import ArticleStatus


logger = logging.getLogger(__name__)


def build_article_payload(article: Article) -> dict:
    return {
        "article": {
            "app": article._meta.app_label,
            "model": article._meta.model_name,
            "id": article.id,
            "title": article.title,
            "status": article.status,
            "tags": [
                {
                    "id": tag.id,
                    "name": tag.name,
                }
                for tag in article.tags.all()
            ],
        }
    }


def publish_article_created_activity(*, article: Article) -> None:
    if article.status != ArticleStatus.PUBLISHED:
        return

    try:
        get_activity_service().publish(
            actor=article.author,
            verb=ActivityVerb.ARTICLE_CREATED.value,
            target_obj=article,
            payload={
                "activity_kind": "article_published",
                **build_article_payload(article),
            },
            is_private=False,
            notify_users=None,
        )
    except Exception:
        logger.exception(
            "Failed to publish article created activity article_id=%s",
            article.id,
        )


def publish_article_updated_activity(*, article: Article) -> None:
    if article.status != ArticleStatus.PUBLISHED:
        return

    try:
        get_activity_service().publish(
            actor=article.author,
            verb=ActivityVerb.ARTICLE_CREATED.value,
            target_obj=article,
            payload={
                "activity_kind": "article_updated",
                **build_article_payload(article),
            },
            is_private=False,
            notify_users=None,
        )
    except Exception:
        logger.exception(
            "Failed to publish article updated activity article_id=%s",
            article.id,
        )
