from __future__ import annotations

from django.urls import path

from .views import (
    BrandCreateView,
    BrandDetailView,
    BrandListView,
    FragranceCreateView,
    FragranceDeleteView,
    FragranceDetailByIdView,
    FragranceDetailBySlugView,
    FragranceListView,
    FragranceUpdateView,
    NoteDetailView,
    NoteListView,
    NoteCreateView,
    OlfactoryFamilyCreateView,
    OlfactoryFamilyDetailView,
    OlfactoryFamilyListView,
    PerfumerCreateView,
    PerfumerDetailView,
    PerfumerListView,
    FragranceOptionListView,
    PerfumerOptionListView,
    BrandOptionListView,
    NoteOptionListView,
    OlfactoryFamilyOptionListView

)


urlpatterns = [
    path("brands", BrandListView.as_view(), name="fr_brands"),
    path("brands/create", BrandCreateView.as_view(), name="fr_brand_create"),
    path("brands/<slug:slug>", BrandDetailView.as_view(), name="fr_brand_detail"),

    path("perfumers", PerfumerListView.as_view(), name="fr_perfumers"),
    path("perfumers/create", PerfumerCreateView.as_view(), name="fr_perfumer_create"),
    path("perfumers/<int:pk>", PerfumerDetailView.as_view(), name="fr_perfumer_detail"),

    path("notes", NoteListView.as_view(), name="fr_notes"),
    path("notes/create", NoteCreateView.as_view(), name="fr_note_create"),
    path("notes/<slug:slug>", NoteDetailView.as_view(), name="fr_note_detail"),

    path("families", OlfactoryFamilyListView.as_view(), name="fr_families"),
    path("families/create", OlfactoryFamilyCreateView.as_view(), name="fr_family_create"),
    path("families/<slug:slug>", OlfactoryFamilyDetailView.as_view(), name="fr_family_detail"),

    path("fragrances", FragranceListView.as_view(), name="fr_list"),
    path("fragrances/<int:pk>", FragranceDetailByIdView.as_view(), name="fr_detail"),
    path("fragrances/slug/<slug:slug>", FragranceDetailBySlugView.as_view(), name="fr_detail_slug"),

    path("fragrances/create", FragranceCreateView.as_view(), name="fr_create"),
    path("fragrances/<int:pk>/update", FragranceUpdateView.as_view(), name="fr_update"),
    path("fragrances/<int:pk>/delete", FragranceDeleteView.as_view(), name="fr_delete"),

    path("fragrances/options", FragranceOptionListView.as_view(), name="fr_options"),
    path("options/brands", BrandOptionListView.as_view(), name="fr_options_brands"),
    path("options/notes", NoteOptionListView.as_view(), name="fr_options_notes"),
    path("options/families", OlfactoryFamilyOptionListView.as_view(), name="fr_options_families"),
    path("options/perfumers", PerfumerOptionListView.as_view(), name="fr_options_perfumers"),
    path("options/fragrances", FragranceOptionListView.as_view(), name="fr_options_fragrances"),
]
