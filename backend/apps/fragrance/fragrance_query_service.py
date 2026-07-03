from __future__ import annotations

from django.db.models import Case, IntegerField, Prefetch, Value, When
from django.contrib.contenttypes.models import ContentType
from django.db.models import BooleanField, Exists, OuterRef, Value

from apps.fragrance.models import FragranceModel, FragranceNoteOfficialModel
from apps.likes.models import LikeModel
from apps.photos.selectors import attach_object_photos


class FragranceQueryService:
    @staticmethod
    def list_queryset():
        return FragranceModel.objects.select_related("brand")

    @staticmethod
    def detail_queryset():
        note_links = (
            FragranceNoteOfficialModel.objects.select_related("note")
            .annotate(
                level_order=Case(
                    When(level="top", then=Value(0)),
                    When(level="heart", then=Value(1)),
                    When(level="base", then=Value(2)),
                    default=Value(99),
                    output_field=IntegerField(),
                )
            )
            .order_by("level_order", "position", "id")
        )

        return (
            FragranceModel.objects.select_related("brand")
            .prefetch_related(
                "perfumers",
                "families",
                Prefetch(
                    "official_note_links",
                    queryset=note_links,
                    to_attr="prefetched_official_note_links",
                ),
            )
        )

    @staticmethod
    def attach_cover_images(items):
        attach_object_photos(items)
        return items

    @staticmethod
    def attach_cover_image(obj):
        attach_object_photos([obj])
        return obj

    @staticmethod
    def with_user_likes(qs, user):
        if not getattr(user, "is_authenticated", False):
            return qs.annotate(
                is_liked=Value(False, output_field=BooleanField()),
            )

        content_type = ContentType.objects.get_for_model(
            FragranceModel,
            for_concrete_model=False,
        )

        user_likes = LikeModel.objects.filter(
            user=user,
            content_type=content_type,
            object_id=OuterRef("pk"),
        )

        return qs.annotate(
            is_liked=Exists(user_likes),
        )
