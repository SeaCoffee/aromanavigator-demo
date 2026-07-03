from __future__ import annotations

from django.db import models
from django.db.models import Case, IntegerField, Q, Sum, Value, When
from django.db.models.functions import Coalesce

from core.choises.status_choise import STATUS_CHOISE
from core.choises.note_level_choise import NOTE_LEVEL_CHOICES


SAFE_SUGGEST_ORDERING = {
    "created_at": "created_at",
    "-created_at": "-created_at",
    "score": "score",
    "-score": "-score",
}

SAFE_ADD_REQUEST_ORDERING = {
    "created_at": "created_at",
    "-created_at": "-created_at",
    "updated_at": "updated_at",
    "-updated_at": "-updated_at",
    "brand": "brand_name",
    "-brand": "-brand_name",
    "name": "fragrance_name",
    "-name": "-fragrance_name",
}


def _choice_values(choices) -> set[str]:
    values: set[str] = set()

    for item in choices:
        if isinstance(item, (tuple, list)) and item:
            values.add(str(item[0]))
        else:
            values.add(str(item))

    return values


NOTE_LEVEL_VALUES = _choice_values(NOTE_LEVEL_CHOICES)

PUBLIC_STATUSES = {
    STATUS_CHOISE.APPROVED,
}

ADMIN_STATUSES = {
    STATUS_CHOISE.PENDING,
    STATUS_CHOISE.APPROVED,
    STATUS_CHOISE.REJECTED,
}


def normalize_status(status: str | None, *, allowed: set[str]) -> str | None:
    if not status:
        return None

    clean_status = str(status).strip().lower()

    if clean_status not in allowed:
        return None

    return clean_status


class FragranceUGCBaseQuerySet(models.QuerySet):
    def with_relations(self):
        return self.select_related("fragrance", "fragrance__brand", "created_by")

    def _score_annotation(self, votes_rel_name: str):
        return Coalesce(
            Sum(
                Case(
                    When(**{f"{votes_rel_name}__value": 1}, then=Value(1)),
                    When(**{f"{votes_rel_name}__value": -1}, then=Value(-1)),
                    default=Value(0),
                    output_field=IntegerField(),
                )
            ),
            Value(0),
            output_field=IntegerField(),
        )

    def with_public_status(self, status: str | None):
        clean_status = normalize_status(status, allowed=PUBLIC_STATUSES)

        if clean_status:
            return self.filter(status=clean_status)

        return self.filter(status__in=PUBLIC_STATUSES)

    def with_admin_status(self, status: str | None):
        clean_status = normalize_status(status, allowed=ADMIN_STATUSES)

        if not clean_status:
            return self

        return self.filter(status=clean_status)

    def safe_order(self, ordering: str | None):
        field = SAFE_SUGGEST_ORDERING.get((ordering or "").strip())

        if not field:
            return self.order_by("-created_at", "-id")

        return self.order_by(field, "-id")


class UserFragranceNoteSuggestionQuerySet(FragranceUGCBaseQuerySet):
    def with_relations(self):
        return super().with_relations().select_related("note")

    def for_fragrance(self, fragrance_id):
        try:
            return self.filter(fragrance_id=int(fragrance_id))
        except (TypeError, ValueError):
            return self.none()

    def with_score(self):
        return self.annotate(score=self._score_annotation("votes"))

    def with_level(self, level: str | None):
        clean_level = (level or "").strip().lower()

        if not clean_level:
            return self

        if clean_level not in NOTE_LEVEL_VALUES:
            return self.none()

        return self.filter(level=clean_level)


class FragranceSimilaritySuggestionQuerySet(FragranceUGCBaseQuerySet):
    def with_relations(self):
        return (
            super()
            .with_relations()
            .select_related("similar_fragrance", "similar_fragrance__brand")
        )

    def for_fragrance(self, fragrance_id):
        try:
            fid = int(fragrance_id)
        except (TypeError, ValueError):
            return self.none()

        return self.filter(Q(fragrance_id=fid) | Q(similar_fragrance_id=fid))

    def with_score(self):
        return self.annotate(score=self._score_annotation("votes"))


class FragranceAddRequestQuerySet(models.QuerySet):
    def with_relations(self):
        return self.select_related(
            "created_by",
            "processed_by",
            "created_fragrance",
            "created_fragrance__brand",
        )

    def for_user(self, user):
        return self.filter(created_by=user)

    def with_status(self, status: str | None):
        clean_status = normalize_status(status, allowed=ADMIN_STATUSES)

        if not clean_status:
            return self

        return self.filter(status=clean_status)

    def search(self, q: str | None):
        value = (q or "").strip()

        if not value:
            return self

        return self.filter(
            Q(brand_name__icontains=value)
            | Q(fragrance_name__icontains=value)
            | Q(perfumers_text__icontains=value)
            | Q(notes_text__icontains=value)
            | Q(families_text__icontains=value)
            | Q(links_text__icontains=value)
        )

    def safe_order(self, ordering: str | None):
        field = SAFE_ADD_REQUEST_ORDERING.get((ordering or "").strip())

        if not field:
            return self.order_by("-created_at", "-id")

        return self.order_by(field, "-id")

    def newest_first(self):
        return self.order_by("-created_at", "-id")
