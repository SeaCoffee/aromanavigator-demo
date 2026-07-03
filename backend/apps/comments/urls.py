from __future__ import annotations

from django.urls import path

from .views import (
    CommentDetailView,
    CommentListCreateView,
    CommentThreadByTargetView,
    ModCommentListView,
)


app_name = "comments"

urlpatterns = [
    path("", CommentListCreateView.as_view(), name="comment-list-create"),
    path("mod", ModCommentListView.as_view(), name="mod-comment-list"),
    path("thread", CommentThreadByTargetView.as_view(), name="comment-thread"),
    path("<int:pk>", CommentDetailView.as_view(), name="comment-detail"),
]
