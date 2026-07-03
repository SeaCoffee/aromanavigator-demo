from django.urls import path

from apps.taste_profile.views import (
    MyTasteProfileView,
    PublicTasteProfileView,
    TasteBrandPreferenceDetailView,
    TasteBrandPreferenceListCreateView,
    TasteConcentrationPreferenceDetailView,
    TasteConcentrationPreferenceListCreateView,
    TasteFamilyPreferenceDetailView,
    TasteFamilyPreferenceListCreateView,
    TasteFragranceMarkDetailView,
    TasteFragranceMarkListCreateView,
    TasteNotePreferenceDetailView,
    TasteNotePreferenceListCreateView,
    TastePerfumerPreferenceDetailView,
    TastePerfumerPreferenceListCreateView,
    TasteSeasonPreferenceDetailView,
    TasteSeasonPreferenceListCreateView,
)

app_name = "taste_profile"

urlpatterns = [
    path("me", MyTasteProfileView.as_view(), name="taste-profile-me"),

    path(
        "users/<int:user_id>",
        PublicTasteProfileView.as_view(),
        name="taste-profile-public-user",
    ),
    path(
        "u/<str:display_name>",
        PublicTasteProfileView.as_view(),
        name="taste-profile-public-display-name",
    ),

    path(
        "me/families",
        TasteFamilyPreferenceListCreateView.as_view(),
        name="taste-family-list-create",
    ),
    path(
        "me/families/<int:item_id>",
        TasteFamilyPreferenceDetailView.as_view(),
        name="taste-family-detail",
    ),

    path(
        "me/notes",
        TasteNotePreferenceListCreateView.as_view(),
        name="taste-note-list-create",
    ),
    path(
        "me/notes/<int:item_id>",
        TasteNotePreferenceDetailView.as_view(),
        name="taste-note-detail",
    ),

    path(
        "me/perfumers",
        TastePerfumerPreferenceListCreateView.as_view(),
        name="taste-perfumer-list-create",
    ),
    path(
        "me/perfumers/<int:item_id>",
        TastePerfumerPreferenceDetailView.as_view(),
        name="taste-perfumer-detail",
    ),

    path(
        "me/brands",
        TasteBrandPreferenceListCreateView.as_view(),
        name="taste-brand-list-create",
    ),
    path(
        "me/brands/<int:item_id>",
        TasteBrandPreferenceDetailView.as_view(),
        name="taste-brand-detail",
    ),

    path(
        "me/seasons",
        TasteSeasonPreferenceListCreateView.as_view(),
        name="taste-season-list-create",
    ),
    path(
        "me/seasons/<int:item_id>",
        TasteSeasonPreferenceDetailView.as_view(),
        name="taste-season-detail",
    ),

    path(
        "me/concentrations",
        TasteConcentrationPreferenceListCreateView.as_view(),
        name="taste-concentration-list-create",
    ),
    path(
        "me/concentrations/<int:item_id>",
        TasteConcentrationPreferenceDetailView.as_view(),
        name="taste-concentration-detail",
    ),

    path(
        "me/fragrances",
        TasteFragranceMarkListCreateView.as_view(),
        name="taste-fragrance-mark-list-create",
    ),
    path(
        "me/fragrances/<int:item_id>",
        TasteFragranceMarkDetailView.as_view(),
        name="taste-fragrance-mark-detail",
    ),
]
