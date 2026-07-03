from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import (
    CreateAPIView,
    DestroyAPIView,
    GenericAPIView,
    ListAPIView,
    RetrieveAPIView,
    UpdateAPIView,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.users.admin_suspension_service import AdminSuspensionService
from apps.users.filters import PublicUserFilter, UserFilter
from apps.users.permissions import (
    IsAdminOrSuperuser,
    IsNotSuspended,
    IsSuperuser,
)
from apps.users.selectors import (
    admin_action_user_queryset,
    admin_users_queryset,
    get_admin_user_by_lookup_value,
    get_public_user_by_display_name,
    public_user_search_queryset,
    public_users_queryset,
    user_with_profile_stats_queryset,
)
from apps.users.serializers import (
    ChangePasswordSerializer,
    SuspendSerializer,
    UserAdminSerializer,
    UserMeSerializer,
    UserPublicSerializer,
    UserRegisterSerializer,
    UserSelfUpdateSerializer,
)
from apps.users.user_account_service import UserAccountService
from apps.users.user_password_service import UserPasswordService
from apps.users.user_profile_service import UserProfileService
from apps.users.user_registration_service import UserRegistrationService
from apps.users.user_role_service import UserRoleService
from core.pagination import PagePagination


def raise_drf_validation_error(exc: DjangoValidationError):
    from rest_framework.exceptions import ValidationError as DRFValidationError

    if hasattr(exc, "message_dict"):
        raise DRFValidationError(expand_dotted_validation_errors(exc.message_dict))

    raise DRFValidationError(exc.messages)


def expand_dotted_validation_errors(message_dict: dict) -> dict:
    errors: dict = {}

    for key, value in message_dict.items():
        if "." not in key:
            errors[key] = value
            continue

        cursor = errors
        parts = key.split(".")

        for part in parts[:-1]:
            cursor = cursor.setdefault(part, {})

        cursor[parts[-1]] = value

    return errors


class UserCreateView(CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = (AllowAny,)
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            user = UserRegistrationService.register(
                serializer.validated_data,
                request=request,
            )
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)

        output_serializer = UserMeSerializer(
            user,
            context=self.get_serializer_context(),
        )

        return Response(
            output_serializer.data,
            status=status.HTTP_201_CREATED,
        )

class UserPublicListView(ListAPIView):
    serializer_class = UserPublicSerializer
    permission_classes = [AllowAny]
    pagination_class = PagePagination
    filter_backends = [
        DjangoFilterBackend,
        OrderingFilter,
        SearchFilter,
    ]
    filterset_class = PublicUserFilter
    search_fields = [
        "profile__display_name",
        "profile__name",
    ]

    def get_queryset(self):
        return public_users_queryset(viewer=self.request.user)


class UserAdminListView(ListAPIView):
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperuser]
    pagination_class = PagePagination
    filter_backends = [
        DjangoFilterBackend,
        OrderingFilter,
        SearchFilter,
    ]
    filterset_class = UserFilter
    search_fields = [
        "email",
        "profile__display_name",
        "profile__name",
    ]
    ordering = ("-created_at",)
    ordering_fields = (
        "created_at",
        "email",
    )

    def get_queryset(self):
        return admin_users_queryset().order_by(*self.ordering)


class AdminUserActionMixin(GenericAPIView):
    serializer_class = UserAdminSerializer

    def get_queryset(self):
        return admin_action_user_queryset(actor=self.request.user)


class BlockUserView(AdminUserActionMixin):
    permission_classes = [IsAuthenticated, IsAdminOrSuperuser]

    def patch(self, request, *args, **kwargs):
        user = self.get_object()

        try:
            updated = AdminSuspensionService.suspend(
                admin=request.user,
                target=user,
                permanent=True,
                reason=request.data.get("reason", ""),
            )
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)

        return Response(
            self.get_serializer(updated).data,
            status=status.HTTP_200_OK,
        )


class UnBlockUserView(AdminUserActionMixin):
    permission_classes = [IsAuthenticated, IsAdminOrSuperuser]

    def patch(self, request, *args, **kwargs):
        user = self.get_object()

        try:
            updated = AdminSuspensionService.unsuspend(
                admin=request.user,
                target=user,
            )
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)

        return Response(
            self.get_serializer(updated).data,
            status=status.HTTP_200_OK,
        )


class UserToAdminView(AdminUserActionMixin):
    permission_classes = [IsAuthenticated, IsSuperuser]

    def patch(self, request, *args, **kwargs):
        user = self.get_object()

        try:
            updated = UserRoleService.make_admin(
                user,
                actor=request.user,
            )
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)

        return Response(
            self.get_serializer(updated).data,
            status=status.HTTP_200_OK,
        )


class UserToModeratorView(AdminUserActionMixin):
    permission_classes = [IsAuthenticated, IsAdminOrSuperuser]

    def patch(self, request, *args, **kwargs):
        user = self.get_object()

        try:
            updated = UserRoleService.make_moderator(
                user,
                actor=request.user,
            )
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)

        return Response(
            self.get_serializer(updated).data,
            status=status.HTTP_200_OK,
        )


class UserToUserView(AdminUserActionMixin):
    permission_classes = [IsAuthenticated, IsAdminOrSuperuser]

    def patch(self, request, *args, **kwargs):
        user = self.get_object()

        try:
            updated = UserRoleService.make_user(
                user,
                actor=request.user,
            )
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)

        return Response(
            self.get_serializer(updated).data,
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            UserPasswordService.change_password(
                user=request.user,
                old_password=serializer.validated_data["old_password"],
                new_password=serializer.validated_data["new_password"],
            )
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)

        return Response(
            {"detail": "РџР°СЂРѕР»СЊ СѓСЃРїС–С€РЅРѕ Р·РјС–РЅРµРЅРѕ."},
            status=status.HTTP_200_OK,
        )


class PasswordSetupView(APIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]

    def post(self, request):
        try:
            UserPasswordService.request_password_setup(user=request.user)
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)

        return Response(
            {
                "detail": (
                    "РџРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ РІСЃС‚Р°РЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ РЅР°РґС–СЃР»Р°РЅРѕ "
                    "РЅР° email Р°РєР°СѓРЅС‚Р°."
                )
            },
            status=status.HTTP_200_OK,
        )


class DeleteSelfView(DestroyAPIView):
    http_method_names = ["delete"]
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def perform_destroy(self, instance):
        try:
            UserAccountService.delete_self(instance)
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)


class UserRetrieveView(RetrieveAPIView):
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperuser]

    def get_object(self):
        lookup_value = self.kwargs.get("lookup_value") or ""
        user = get_admin_user_by_lookup_value(lookup_value=lookup_value)

        if user is None:
            raise NotFound("User not found")

        return user


class UpdateSelfView(UpdateAPIView):
    serializer_class = UserSelfUpdateSerializer
    permission_classes = [IsAuthenticated, IsNotSuspended]
    http_method_names = ["patch"]

    def get_object(self):
        return self.request.user

    def partial_update(self, request, *args, **kwargs):
        user = self.get_object()

        serializer = self.get_serializer(
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        try:
            updated = UserProfileService.update_profile(
                user=user,
                profile_data=serializer.validated_data.get("profile", {}),
            )
        except DjangoValidationError as exc:
            from rest_framework.exceptions import ValidationError as DRFValidationError

            if hasattr(exc, "message_dict"):
                raise DRFValidationError({"profile": exc.message_dict})

            raise DRFValidationError({"profile": {"detail": exc.messages}})

        return Response(
            UserMeSerializer(
                updated,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )


class UserFilteredListView(ListAPIView):
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated, IsAdminOrSuperuser]
    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
    ]
    search_fields = [
        "email",
        "profile__display_name",
        "profile__name",
    ]
    filterset_class = UserFilter

    def get_queryset(self):
        return admin_users_queryset()


class AdminSuspendUserView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrSuperuser]
    serializer_class = SuspendSerializer

    def get_queryset(self):
        return admin_action_user_queryset(actor=self.request.user)

    def patch(self, request, pk: int):
        user = get_object_or_404(
            self.get_queryset(),
            pk=pk,
        )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            updated = AdminSuspensionService.suspend(
                admin=request.user,
                target=user,
                until=serializer.validated_data.get("until"),
                permanent=serializer.validated_data.get("permanent", False),
                reason=serializer.validated_data.get("reason", ""),
            )
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)

        return Response(
            {
                "id": updated.id,
                "suspended_until": updated.suspended_until,
                "suspended_indefinitely": updated.suspended_indefinitely,
                "is_suspended": updated.is_suspended,
                "suspension_seconds_left": updated.suspension_seconds_left,
            },
            status=status.HTTP_200_OK,
        )


class AdminUnsuspendUserView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrSuperuser]

    def get_queryset(self):
        return admin_action_user_queryset(actor=self.request.user)

    def patch(self, request, pk: int):
        user = get_object_or_404(
            self.get_queryset(),
            pk=pk,
        )

        try:
            updated = AdminSuspensionService.unsuspend(
                admin=request.user,
                target=user,
            )
        except DjangoValidationError as exc:
            raise_drf_validation_error(exc)

        return Response(
            {
                "id": updated.id,
                "is_suspended": updated.is_suspended,
            },
            status=status.HTTP_200_OK,
        )


class MeSuspendedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response(
            {
                "is_suspended": user.is_suspended,
                "suspended_until": user.suspended_until,
                "suspended_indefinitely": user.suspended_indefinitely,
                "suspension_seconds_left": user.suspension_seconds_left,
                "suspended_reason": user.suspended_reason,
                "server_now": timezone.now().isoformat(),
            },
            status=status.HTTP_200_OK,
        )


class MeView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserMeSerializer

    def get_queryset(self):
        return user_with_profile_stats_queryset()

    def get_object(self):
        return self.get_queryset().get(pk=self.request.user.pk)


class PublicUserSearchView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserPublicSerializer
    pagination_class = PagePagination

    def get_queryset(self):
        return public_user_search_queryset(
            query=self.request.query_params.get("q") or "",
            viewer=self.request.user,
        )


class PublicUserByDisplayNameView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserPublicSerializer
    lookup_url_kwarg = "username"

    def get_object(self):
        raw_username = self.kwargs.get(self.lookup_url_kwarg) or ""
        user = get_public_user_by_display_name(
            display_name=raw_username,
            viewer=self.request.user,
        )

        if user is None:
            raise NotFound("User not found")

        return user
