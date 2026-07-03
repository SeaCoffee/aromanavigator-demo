from __future__ import annotations

from django.core.exceptions import PermissionDenied as DjangoPermissionDenied
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.auth.auth_services import (
    AuthActivationService,
    AuthLogoutService,
    AuthTokenErrorMessages,
    PasswordRecoveryService,
)
from apps.auth.exceptions.auth_social_exception import SocialProviderConfigError
from apps.auth.exceptions.jwt_exceptions import JWTException
from apps.auth.serializers import (
    EmailSerializer,
    GoogleAuthSerializer,
    LoginSerializer,
    PasswordSerializer,
    RefreshTokenSerializer,
    SafeTokenRefreshSerializer,
)
from apps.auth.social_auth_service import GoogleAuthService
from apps.users.serializers import UserMeSerializer
from core.common_services.jwt_service import issue_tokens_payload


def django_validation_to_response(exc: DjangoValidationError) -> Response:
    if hasattr(exc, "message_dict"):
        return Response(
            exc.message_dict,
            status=status.HTTP_400_BAD_REQUEST,
        )

    messages = getattr(exc, "messages", None)

    if messages:
        return Response(
            {"detail": messages},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response(
        {"detail": str(exc)},
        status=status.HTTP_400_BAD_REQUEST,
    )


def token_exception_response(exc: JWTException, *, messages: dict) -> Response:
    for exc_class, message in messages.items():
        if isinstance(exc, exc_class):
            return Response(
                {"detail": message},
                status=status.HTTP_400_BAD_REQUEST,
            )

    return Response(
        {"detail": "Token error"},
        status=status.HTTP_400_BAD_REQUEST,
    )


class ActivateUserView(GenericAPIView):
    permission_classes = (AllowAny,)

    def get(self, request, *args, **kwargs):
        token = kwargs.get("token")

        try:
            user = AuthActivationService.activate(token)
        except JWTException as exc:
            return token_exception_response(
                exc,
                messages=AuthTokenErrorMessages.ACTIVATION,
            )

        return Response(
            UserMeSerializer(
                user,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )


class RecoverRequestView(GenericAPIView):
    permission_classes = (AllowAny,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_recovery"
    serializer_class = EmailSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        PasswordRecoveryService.request_recovery(
            serializer.validated_data["email"],
        )

        return Response(
            {
                "detail": (
                    "РЇРєС‰Рѕ РѕР±Р»С–РєРѕРІРёР№ Р·Р°РїРёСЃ С–Р· С‚Р°РєРѕСЋ РµР»РµРєС‚СЂРѕРЅРЅРѕСЋ РїРѕС€С‚РѕСЋ С–СЃРЅСѓС”, "
                    "РјРё РЅР°РґС–СЃР»Р°Р»Рё РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ РІС–РґРЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ."
                )
            },
            status=status.HTTP_200_OK,
        )


class RecoveryPasswordView(GenericAPIView):
    permission_classes = (AllowAny,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset"
    serializer_class = PasswordSerializer

    def get(self, request, *args, **kwargs):
        token = kwargs["token"]

        try:
            PasswordRecoveryService.verify_recovery_token(token)
        except JWTException as exc:
            return token_exception_response(
                exc,
                messages=AuthTokenErrorMessages.RECOVERY,
            )

        return Response(
            {"detail": "РџРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ РІС–РґРЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ РґС–Р№СЃРЅРµ."},
            status=status.HTTP_200_OK,
        )

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            PasswordRecoveryService.reset_password(
                token=kwargs["token"],
                password=serializer.validated_data["password"],
            )
        except JWTException as exc:
            return token_exception_response(
                exc,
                messages=AuthTokenErrorMessages.RECOVERY,
            )
        except DjangoValidationError as exc:
            return django_validation_to_response(exc)

        return Response(
            {"detail": "РџР°СЂРѕР»СЊ СѓСЃРїС–С€РЅРѕ Р·РјС–РЅРµРЅРѕ."},
            status=status.HTTP_200_OK,
        )


class LoginView(TokenObtainPairView):
    permission_classes = (AllowAny,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        email = (
            request.data.get("email")
            or request.data.get("username")
            or ""
        )

        return super().post(request, *args, **kwargs)


class RefreshView(TokenRefreshView):
    permission_classes = (AllowAny,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_refresh"
    serializer_class = SafeTokenRefreshSerializer


class LogoutView(GenericAPIView):
    permission_classes = (IsAuthenticated,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "logout"
    serializer_class = RefreshTokenSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        AuthLogoutService.logout(
            user=request.user,
            refresh=serializer.validated_data.get("refresh"),
        )

        return Response(
            {"detail": "Logged out successfully"},
            status=status.HTTP_200_OK,
        )


class GoogleLoginView(GenericAPIView):
    authentication_classes = []
    permission_classes = (AllowAny,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "social_login"
    serializer_class = GoogleAuthSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user, created = GoogleAuthService.login_with_id_token(
                serializer.validated_data["id_token"],
                request=request,
            )
        except DjangoPermissionDenied as exc:
            raise PermissionDenied(str(exc))
        except DjangoValidationError as exc:
            return django_validation_to_response(exc)
        except SocialProviderConfigError:
            return Response(
                {"detail": "Google OAuth не налаштовано: потрібні реальні client id/client secret у змінних середовища."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        tokens = issue_tokens_payload(user)

        return Response(
            {
                **tokens,
                "user": UserMeSerializer(
                    user,
                    context={"request": request},
                ).data,
                "created": created,
            },
            status=status.HTTP_200_OK,
        )
