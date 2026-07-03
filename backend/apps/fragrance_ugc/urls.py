from __future__ import annotations

from django.urls import path

from .mod_views import (
    ModAddRequestApproveWithFragranceView,
    ModAddRequestAttachFragranceView,
    ModAddRequestCreateFragranceApproveView,
    ModAddRequestSetStatusView,
    ModAddRequestUpdateView,
    ModNoteSuggestionSetStatusView,
    ModSimilaritySuggestionSetStatusView,
)

from .views import (
    AdminFragranceAddRequestsView,
    AdminNoteSuggestionsView,
    AdminSimilaritySuggestionsView,
    FragranceAddRequestCreateView,
    MyFragranceAddRequestsView,
    NoteSuggestionCreateView,
    NoteSuggestionListByFragranceView,
    NoteVoteCreateView,
    SimilaritySuggestionCreateView,
    SimilaritySuggestionListByFragranceView,
    SimilarityVoteCreateView,
    AdminFragranceAddRequestDetailView
)


urlpatterns = [
    path(
        "fragrances/<int:fragrance_id>/note-suggestions",
        NoteSuggestionListByFragranceView.as_view(),
        name="fr_ugc_note_suggest_list",
    ),
    path(
        "fragrances/<int:fragrance_id>/note-suggestions/create",
        NoteSuggestionCreateView.as_view(),
        name="fr_ugc_note_suggest_create",
    ),
    path(
        "note-suggestions/<int:suggestion_id>/vote",
        NoteVoteCreateView.as_view(),
        name="fr_ugc_note_vote",
    ),
    path(
        "mod/note-suggestions",
        AdminNoteSuggestionsView.as_view(),
        name="fr_ugc_note_suggest_mod_list",
    ),
    path(
        "mod/note-suggestions/<int:pk>/status",
        ModNoteSuggestionSetStatusView.as_view(),
        name="mod_fr_note_suggest_status",
    ),

    path(
        "fragrances/<int:fragrance_id>/similarity-suggestions",
        SimilaritySuggestionListByFragranceView.as_view(),
        name="fr_ugc_sim_suggest_list",
    ),
    path(
        "fragrances/<int:fragrance_id>/similarity-suggestions/create",
        SimilaritySuggestionCreateView.as_view(),
        name="fr_ugc_sim_suggest_create",
    ),
    path(
        "similarity-suggestions/<int:suggestion_id>/vote",
        SimilarityVoteCreateView.as_view(),
        name="fr_ugc_sim_vote",
    ),
    path(
        "mod/similarity-suggestions",
        AdminSimilaritySuggestionsView.as_view(),
        name="fr_ugc_sim_suggest_mod_list",
    ),
    path(
        "mod/similarity-suggestions/<int:pk>/status",
        ModSimilaritySuggestionSetStatusView.as_view(),
        name="mod_fr_sim_suggest_status",
    ),

    path(
        "add-requests",
        FragranceAddRequestCreateView.as_view(),
        name="fr_addreq_create",
    ),
    path(
        "add-requests/my",
        MyFragranceAddRequestsView.as_view(),
        name="fr_addreq_my",
    ),
    path(
        "mod/add-requests",
        AdminFragranceAddRequestsView.as_view(),
        name="fr_addreq_mod_list",
    ),
    path(
        "mod/add-requests/<int:pk>",
        ModAddRequestUpdateView.as_view(),
        name="mod_fr_addreq_update",
    ),
    path(
        "mod/add-requests/<int:pk>/status",
        ModAddRequestSetStatusView.as_view(),
        name="mod_fr_addreq_status",
    ),
    path(
        "mod/add-requests/<int:pk>/attach-fragrance",
        ModAddRequestAttachFragranceView.as_view(),
        name="mod_fr_addreq_attach_fragrance",
    ),
    path(
        "mod/add-requests/<int:pk>/approve-with-fragrance",
        ModAddRequestApproveWithFragranceView.as_view(),
        name="mod_fr_addreq_approve_with_fragrance",
    ),

    path(
        "mod/add-requests/<int:pk>/detail",
        AdminFragranceAddRequestDetailView.as_view(),
        name="fr_addreq_mod_detail",
    ),

    path(
    "mod/add-requests/<int:pk>/create-fragrance-and-approve",
    ModAddRequestCreateFragranceApproveView.as_view(),
    name="mod_fr_addreq_create_fragrance_and_approve",
),
]
