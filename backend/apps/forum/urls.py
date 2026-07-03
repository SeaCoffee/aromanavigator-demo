from __future__ import annotations

from django.urls import path

from .views import (
    ForumSectionListCreateView,
    ForumSectionRetrieveUpdateDestroyView,
    ForumTopicListCreateView,
    ForumTopicRetrieveUpdateDestroyView,
)


app_name = "forum"

urlpatterns = [
    path("sections", ForumSectionListCreateView.as_view(), name="forum-section-list"),
    path("sections/<int:pk>", ForumSectionRetrieveUpdateDestroyView.as_view(), name="forum-section-detail"),

    path("topics", ForumTopicListCreateView.as_view(), name="forum-topic-list"),
    path("topics/<int:pk>", ForumTopicRetrieveUpdateDestroyView.as_view(), name="forum-topic-detail"),
]
