from django.urls import path

from apps.wardrobe.views import (
    MyWardrobeListCreateView,
    PublicWardrobeListView,
    WardrobeDetailView,
)

app_name = "wardrobe"

urlpatterns = [
    path("me", MyWardrobeListCreateView.as_view(), name="wardrobe-me"),
    path("me/<int:item_id>", WardrobeDetailView.as_view(), name="wardrobe-detail"),

    path(
        "users/<int:user_id>",
        PublicWardrobeListView.as_view(),
        name="wardrobe-public-user",
    ),
    path(
        "u/<str:display_name>",
        PublicWardrobeListView.as_view(),
        name="wardrobe-public-display-name",
    ),
]
