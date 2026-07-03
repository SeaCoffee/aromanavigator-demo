from __future__ import annotations

from django.urls import path

from .views_official_links import (
    OfficialFamilyAddView,
    OfficialFamilyRemoveView,
    OfficialNoteAddView,
    OfficialNoteMetaUpdateView,
    OfficialNoteRemoveView,
    OfficialPerfumerAddView,
    OfficialPerfumerRemoveView,
)


urlpatterns = [
    path(
        "fragrances/<int:fragrance_id>/official/perfumers",
        OfficialPerfumerAddView.as_view(),
        name="fr_official_perfumer_add",
    ),
    path(
        "fragrances/<int:fragrance_id>/official/perfumers/<int:perfumer_id>/delete",
        OfficialPerfumerRemoveView.as_view(),
        name="fr_official_perfumer_delete",
    ),

    path(
        "fragrances/<int:fragrance_id>/official/families",
        OfficialFamilyAddView.as_view(),
        name="fr_official_family_add",
    ),
    path(
        "fragrances/<int:fragrance_id>/official/families/<int:family_id>/delete",
        OfficialFamilyRemoveView.as_view(),
        name="fr_official_family_delete",
    ),

    path(
        "fragrances/<int:fragrance_id>/official/notes",
        OfficialNoteAddView.as_view(),
        name="fr_official_note_add",
    ),
    path(
        "fragrances/<int:fragrance_id>/official/notes/<int:note_id>/<str:level>",
        OfficialNoteMetaUpdateView.as_view(),
        name="fr_official_note_update",
    ),
    path(
        "fragrances/<int:fragrance_id>/official/notes/<int:note_id>/<str:level>/delete",
        OfficialNoteRemoveView.as_view(),
        name="fr_official_note_delete",
    ),
]
