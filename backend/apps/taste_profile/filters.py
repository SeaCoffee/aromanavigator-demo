from django.db.models import Q
from django_filters import rest_framework as filters

from core.choises.taste_profile_choise import (
    TasteAttitude,
    TasteConcentration,
    TasteFragranceMark,
    TastePriority,
    TasteSeason,
)
from .models import (
    TasteBrandPreferenceModel,
    TasteConcentrationPreferenceModel,
    TasteFamilyPreferenceModel,
    TasteFragranceMarkModel,
    TasteNotePreferenceModel,
    TastePerfumerPreferenceModel,
    TasteSeasonPreferenceModel,
)


class TasteFamilyPreferenceFilter(filters.FilterSet):
    attitude = filters.ChoiceFilter(choices=TasteAttitude.choices)
    family = filters.NumberFilter(field_name="family_id")
    q = filters.CharFilter(method="filter_q")

    class Meta:
        model = TasteFamilyPreferenceModel
        fields = ["attitude", "family"]

    def filter_q(self, qs, name, value):
        query = (value or "").strip()

        if not query:
            return qs

        return qs.filter(
            Q(comment__icontains=query)
            | Q(family__name__icontains=query)
            | Q(family__slug__icontains=query)
        )


class TasteNotePreferenceFilter(filters.FilterSet):
    attitude = filters.ChoiceFilter(choices=TasteAttitude.choices)
    note = filters.NumberFilter(field_name="note_id")
    q = filters.CharFilter(method="filter_q")

    class Meta:
        model = TasteNotePreferenceModel
        fields = ["attitude", "note"]

    def filter_q(self, qs, name, value):
        query = (value or "").strip()

        if not query:
            return qs

        return qs.filter(
            Q(comment__icontains=query)
            | Q(note__name__icontains=query)
            | Q(note__slug__icontains=query)
        )


class TastePerfumerPreferenceFilter(filters.FilterSet):
    attitude = filters.ChoiceFilter(choices=TasteAttitude.choices)
    perfumer = filters.NumberFilter(field_name="perfumer_id")
    q = filters.CharFilter(method="filter_q")

    class Meta:
        model = TastePerfumerPreferenceModel
        fields = ["attitude", "perfumer"]

    def filter_q(self, qs, name, value):
        query = (value or "").strip()

        if not query:
            return qs

        return qs.filter(
            Q(comment__icontains=query)
            | Q(perfumer__name__icontains=query)
        )


class TasteBrandPreferenceFilter(filters.FilterSet):
    attitude = filters.ChoiceFilter(choices=TasteAttitude.choices)
    brand = filters.NumberFilter(field_name="brand_id")
    q = filters.CharFilter(method="filter_q")

    class Meta:
        model = TasteBrandPreferenceModel
        fields = ["attitude", "brand"]

    def filter_q(self, qs, name, value):
        query = (value or "").strip()

        if not query:
            return qs

        return qs.filter(
            Q(comment__icontains=query)
            | Q(brand__name__icontains=query)
            | Q(brand__slug__icontains=query)
            | Q(brand__country__icontains=query)
        )


class TasteSeasonPreferenceFilter(filters.FilterSet):
    attitude = filters.ChoiceFilter(choices=TasteAttitude.choices)
    season = filters.ChoiceFilter(choices=TasteSeason.choices)
    q = filters.CharFilter(method="filter_q")

    class Meta:
        model = TasteSeasonPreferenceModel
        fields = ["attitude", "season"]

    def filter_q(self, qs, name, value):
        query = (value or "").strip()

        if not query:
            return qs

        return qs.filter(comment__icontains=query)


class TasteConcentrationPreferenceFilter(filters.FilterSet):
    attitude = filters.ChoiceFilter(choices=TasteAttitude.choices)
    concentration = filters.ChoiceFilter(choices=TasteConcentration.choices)
    q = filters.CharFilter(method="filter_q")

    class Meta:
        model = TasteConcentrationPreferenceModel
        fields = ["attitude", "concentration"]

    def filter_q(self, qs, name, value):
        query = (value or "").strip()

        if not query:
            return qs

        return qs.filter(comment__icontains=query)


class TasteFragranceMarkFilter(filters.FilterSet):
    mark = filters.ChoiceFilter(choices=TasteFragranceMark.choices)
    priority = filters.ChoiceFilter(choices=TastePriority.choices)

    fragrance = filters.NumberFilter(field_name="fragrance_id")
    brand = filters.NumberFilter(field_name="fragrance__brand_id")
    family = filters.NumberFilter(method="filter_family")
    note = filters.NumberFilter(method="filter_note")

    q = filters.CharFilter(method="filter_q")

    class Meta:
        model = TasteFragranceMarkModel
        fields = [
            "mark",
            "priority",
            "fragrance",
            "brand",
            "family",
            "note",
        ]

    def filter_family(self, qs, name, value):
        return qs.filter(fragrance__families__id=value).distinct()

    def filter_note(self, qs, name, value):
        return qs.filter(fragrance__notes_official__id=value).distinct()

    def filter_q(self, qs, name, value):
        query = (value or "").strip()

        if not query:
            return qs

        return (
            qs.filter(
                Q(comment__icontains=query)
                | Q(fragrance__name__icontains=query)
                | Q(fragrance__brand__name__icontains=query)
                | Q(fragrance__slug__icontains=query)
            )
            .distinct()
        )
