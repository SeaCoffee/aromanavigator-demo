from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType

from core.models import BaseModel
from core.choises.article_status_choise import ArticleStatus

class Tag(BaseModel):
    """РўРµРіРё РґР»СЏ СЃС‚Р°С‚РµР№"""
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = "a_tag"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Article(BaseModel):
    """Р РµРґР°РєС†РёРѕРЅРЅС‹Рµ СЃС‚Р°С‚СЊРё"""
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="articles")
    title = models.CharField(max_length=200)
    content = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=ArticleStatus.choices,
        default=ArticleStatus.DRAFT,
    )
    moderator_comment = models.TextField(blank=True, null=True)

    tags = models.ManyToManyField(Tag, related_name="articles", blank=True)

    class Meta:
        db_table = "a_article"
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
