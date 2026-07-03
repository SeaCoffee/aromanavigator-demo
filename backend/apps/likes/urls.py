from __future__ import annotations

from django.urls import path

from .views import (
    LikeCreateView,
    LikeDeleteByTargetView,
    LikeDeleteView,
    LikeListView,
    LikeToggleView,
)


app_name = "likes"

urlpatterns = [
    path("", LikeListView.as_view(), name="like-list"),
    path("create", LikeCreateView.as_view(), name="like-create"),
    path("toggle", LikeToggleView.as_view(), name="like-toggle"),
    path("delete-by-target", LikeDeleteByTargetView.as_view(), name="like-delete-by-target"),
    path("<int:pk>/delete", LikeDeleteView.as_view(), name="like-delete"),
]
