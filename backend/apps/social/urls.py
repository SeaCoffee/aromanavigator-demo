from __future__ import annotations

from django.urls import path

from apps.social.views import (
    BlockToggleView,
    FollowersListView,
    FollowingListView,
    FollowToggleView,
    SocialStateView,
    SubscribeView,
    SubscriptionListView,
    SubscriptionDeleteView,
    UnsubscribeView,
)

app_name = "social"

urlpatterns = [
    path("follow/<int:user_id>", FollowToggleView.as_view(), name="social-follow-toggle"),
    path("followers/<int:user_id>", FollowersListView.as_view(), name="social-followers"),
    path("following/<int:user_id>", FollowingListView.as_view(), name="social-following"),

    path("block/<int:user_id>", BlockToggleView.as_view(), name="social-block-toggle"),

    path("subscribe", SubscribeView.as_view(), name="social-subscribe"),
    path("unsubscribe", UnsubscribeView.as_view(), name="social-unsubscribe"),
    path("subscriptions", SubscriptionListView.as_view(), name="social-subscriptions"),
    path("subscriptions/<int:pk>", SubscriptionDeleteView.as_view(), name="social-subscription-delete"),

    path("state/<int:user_id>", SocialStateView.as_view(), name="social-state"),
]
