from django.urls import path

from apps.favorites.views import (
    PerfumeFavoriteCreateView,
    PerfumeFavoriteDeleteByTargetView,
    PerfumeFavoriteDeleteView,
    PerfumeFavoriteListView,
    PerfumeFavoriteToggleView,
)

urlpatterns = [
    path("", PerfumeFavoriteListView.as_view(), name="favorites-list"),
    path("create", PerfumeFavoriteCreateView.as_view(), name="favorites-add"),
    path("toggle", PerfumeFavoriteToggleView.as_view(), name="favorites-toggle"),
    path("by-target", PerfumeFavoriteDeleteByTargetView.as_view(), name="favorites-delete-by-target"),
    path("<int:pk>", PerfumeFavoriteDeleteView.as_view(), name="favorites-delete"),
]
