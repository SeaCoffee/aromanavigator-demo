from django.urls import path

from apps.auth.views import (
    ActivateUserView,
    GoogleLoginView,
    LoginView,
    LogoutView,
    RecoverRequestView,
    RecoveryPasswordView,
    RefreshView,
)


urlpatterns = [
    path("login", LoginView.as_view(), name="auth-login"),
    path("refresh", RefreshView.as_view(), name="auth-refresh"),
    path("logout", LogoutView.as_view(), name="auth-logout"),

    path("activate/<str:token>", ActivateUserView.as_view(), name="auth-activate-account"),

    path("recovery", RecoverRequestView.as_view(), name="auth-recover-password"),
    path("recovery/<str:token>", RecoveryPasswordView.as_view(), name="auth-reset-password"),

    path("google", GoogleLoginView.as_view(), name="auth-google-login"),
]
