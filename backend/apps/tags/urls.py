from __future__ import annotations

from django.urls import path

from apps.tags.views import PopularTagListAPIView, TagListAPIView


app_name = "tags"

urlpatterns = [
    path("", TagListAPIView.as_view(), name="tag-list"),
    path("popular/", PopularTagListAPIView.as_view(), name="tag-popular-list"),
]
