# apps/forum/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone

from core.models import BaseModel
from .managers import ForumTopicManager

class ForumSectionModel(BaseModel):
    class Meta:
        db_table = "forum_section"
        ordering = ("order", "title")
        indexes = [
            models.Index(fields=["is_active", "order"], name="idx_forum_section_active_order"),
            models.Index(fields=["slug"], name="idx_forum_section_slug"),
        ]

    title = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True, default="")

    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    topics_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return self.title


class ForumTopicModel(BaseModel):
    class Meta:
        db_table = "forum_topic"
        ordering = ("-last_activity_at", "-created_at")
        indexes = [
            models.Index(fields=["section", "-created_at"], name="idx_ft_sec_created"),
            models.Index(fields=["author", "-created_at"], name="idx_forum_topic_author_created"),
            models.Index(fields=["slug"], name="idx_forum_topic_slug"),
            models.Index(fields=["is_pinned", "is_locked"], name="idx_forum_topic_pin_lock"),
            models.Index(fields=["likes_count", "comments_count"], name="idx_forum_topic_pop"),
        ]

    section = models.ForeignKey(ForumSectionModel, on_delete=models.CASCADE, related_name="topics")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="forum_topics")

    title = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180)

    content = models.TextField()

    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    is_hidden = models.BooleanField(default=False)

    comments_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    views_count = models.PositiveIntegerField(default=0)

    last_activity_at = models.DateTimeField(default=timezone.now)

    objects = ForumTopicManager()


    def __str__(self) -> str:
        return self.title
