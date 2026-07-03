from __future__ import annotations

from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import F, Q

from apps.tags.models import TagModel, TaggedItemModel
from core.validators.tags_validators import normalize_tag_code


class ForumTopicQuerySet(models.QuerySet):
    def visible(self, user=None):
        if user and getattr(user, "is_authenticated", False):
            if getattr(user, "is_staff", False):
                return self
            return self.filter(Q(is_hidden=False) | Q(author=user))

        return self.filter(is_hidden=False)

    def by_section(self, section_value):
        value = str(section_value or "").strip()
        if not value:
            return self

        if value.isdigit():
            return self.filter(section_id=int(value))

        return self.filter(section__slug=value)

    def by_tag(self, tag_value: str | None):
        code = normalize_tag_code(tag_value or "")
        if not code:
            return self

        tag = TagModel.objects.filter(code=code).only("id").first()
        if not tag:
            return self.none()

        content_type = ContentType.objects.get_for_model(
            self.model,
            for_concrete_model=False,
        )

        tagged_topic_ids = (
            TaggedItemModel.objects
            .filter(content_type=content_type, tag_id=tag.id)
            .values_list("object_id", flat=True)
        )

        return self.filter(id__in=tagged_topic_ids)


class ForumTopicManager(models.Manager.from_queryset(ForumTopicQuerySet)):
    def increment_views(self, topic_id: int) -> None:
        self.filter(id=topic_id).update(views_count=F("views_count") + 1)
