from django.urls import path

from core.site_content_views import (
    AdminFaqDetailView,
    AdminFaqListCreateView,
    AdminFeedbackDetailView,
    AdminFeedbackListView,
    AdminSiteContactSettingsView,
    AdminSitePageDetailView,
    AdminSitePageListView,
    FeedbackCreateView,
    PublicFaqListView,
    PublicSiteContentView,
    PublicSitePageDetailView,
)


urlpatterns = [
    path("site-content", PublicSiteContentView.as_view(), name="public-site-content"),
    path("site-pages/<slug:slug>", PublicSitePageDetailView.as_view(), name="public-site-page"),
    path("faq", PublicFaqListView.as_view(), name="public-faq"),
    path("feedback", FeedbackCreateView.as_view(), name="feedback-create"),
    path("admin/site-content", AdminSiteContactSettingsView.as_view(), name="admin-site-content"),
    path("admin/site-pages", AdminSitePageListView.as_view(), name="admin-site-pages"),
    path("admin/site-pages/<slug:slug>", AdminSitePageDetailView.as_view(), name="admin-site-page"),
    path("admin/faq", AdminFaqListCreateView.as_view(), name="admin-faq"),
    path("admin/faq/<int:pk>", AdminFaqDetailView.as_view(), name="admin-faq-detail"),
    path("admin/feedback", AdminFeedbackListView.as_view(), name="admin-feedback"),
    path("admin/feedback/<int:pk>", AdminFeedbackDetailView.as_view(), name="admin-feedback-detail"),
]
