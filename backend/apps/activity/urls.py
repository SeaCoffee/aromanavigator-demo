# apps/activity/urls.py

from django.urls import path

from apps.activity.views import (
    FeedView,
    PublicFeedView,
    TargetActivityView,
    UserActivityByDisplayNameView,
    UserActivityView,
)

urlpatterns = [
    path("feed", FeedView.as_view(), name="activity-feed"),
    path("public", PublicFeedView.as_view(), name="activity-public-feed"),

    path("user/<int:user_id>", UserActivityView.as_view(), name="activity-user-feed"),
    path(
        "user/by-display-name/<str:display_name>",
        UserActivityByDisplayNameView.as_view(),
        name="activity-user-feed-by-display-name",
    ),

    path(
        "target/<str:app>/<str:model>/<int:obj_id>",
        TargetActivityView.as_view(),
        name="activity-target-feed",
    ),
]
