from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.generics import GenericAPIView, ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.users.permissions import IsNotSuspended
from core.pagination import PagePagination

from apps.taste_profile.filters import (
    TasteBrandPreferenceFilter,
    TasteConcentrationPreferenceFilter,
    TasteFamilyPreferenceFilter,
    TasteFragranceMarkFilter,
    TasteNotePreferenceFilter,
    TastePerfumerPreferenceFilter,
    TasteSeasonPreferenceFilter,
)
from apps.taste_profile.selectors import (
    brand_preferences_for_user,
    concentration_preferences_for_user,
    family_preferences_for_user,
    fragrance_marks_for_user,
    note_preferences_for_user,
    perfumer_preferences_for_user,
    public_taste_profile_for_display_name,
    public_taste_profile_for_user_id,
    season_preferences_for_user,
    taste_profile_for_user,
)
from apps.taste_profile.serializers import (
    TasteBrandPreferenceCreateSerializer,
    TasteBrandPreferenceSerializer,
    TasteBrandPreferenceUpdateSerializer,
    TasteConcentrationPreferenceCreateSerializer,
    TasteConcentrationPreferenceSerializer,
    TasteConcentrationPreferenceUpdateSerializer,
    TasteFamilyPreferenceCreateSerializer,
    TasteFamilyPreferenceSerializer,
    TasteFamilyPreferenceUpdateSerializer,
    TasteFragranceMarkCreateSerializer,
    TasteFragranceMarkSerializer,
    TasteFragranceMarkUpdateSerializer,
    TasteNotePreferenceCreateSerializer,
    TasteNotePreferenceSerializer,
    TasteNotePreferenceUpdateSerializer,
    TastePerfumerPreferenceCreateSerializer,
    TastePerfumerPreferenceSerializer,
    TastePerfumerPreferenceUpdateSerializer,
    TasteProfileSerializer,
    TasteProfileUpdateSerializer,
    TasteSeasonPreferenceCreateSerializer,
    TasteSeasonPreferenceSerializer,
    TasteSeasonPreferenceUpdateSerializer,
)
from apps.taste_profile.service import TasteProfileError, TasteProfileService


class MyTasteProfileView(GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return TasteProfileUpdateSerializer

        return TasteProfileSerializer

    def get(self, request):
        profile = taste_profile_for_user(request.user)

        if profile is None:
            profile = TasteProfileService.get_or_create_profile(request.user)
            profile = taste_profile_for_user(request.user)

        return Response(
            TasteProfileSerializer(
                profile,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        profile = TasteProfileService.update_profile(
            request.user,
            data=serializer.validated_data,
        )

        profile = taste_profile_for_user(request.user) or profile

        return Response(
            TasteProfileSerializer(
                profile,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )


class PublicTasteProfileView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = TasteProfileSerializer

    def get(self, request, user_id: int | None = None, display_name: str | None = None):
        if user_id is not None:
            profile = public_taste_profile_for_user_id(
                user_id=user_id,
                viewer=request.user,
            )
        else:
            profile = public_taste_profile_for_display_name(
                display_name=display_name,
                viewer=request.user,
            )

        if profile is None:
            return Response(
                {"detail": "РџСЂРѕС„С–Р»СЊ СЃРјР°РєС–РІ РЅРµ Р·РЅР°Р№РґРµРЅРѕ Р°Р±Рѕ РІС–РЅ РїСЂРёРІР°С‚РЅРёР№."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            TasteProfileSerializer(
                profile,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_200_OK,
        )


class BaseTastePreferenceListCreateView(ListAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = PagePagination
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    ordering = ["-updated_at"]

    output_serializer_class = None
    create_serializer_class = None

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsNotSuspended()]

        return [IsAuthenticated()]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return self.create_serializer_class

        return self.output_serializer_class

    def serialize_output(self, item):
        return self.output_serializer_class(
            item,
            context=self.get_serializer_context(),
        ).data


class BaseTastePreferenceDetailView(GenericAPIView):
    permission_classes = [IsAuthenticated, IsNotSuspended]

    output_serializer_class = None
    update_serializer_class = None

    def get_serializer_class(self):
        if self.request.method == "PATCH":
            return self.update_serializer_class

        return self.output_serializer_class

    def serialize_output(self, item):
        return self.output_serializer_class(
            item,
            context=self.get_serializer_context(),
        ).data


class TasteFamilyPreferenceListCreateView(BaseTastePreferenceListCreateView):
    filterset_class = TasteFamilyPreferenceFilter
    search_fields = ["comment", "family__name", "family__slug"]
    ordering_fields = ["created_at", "updated_at", "attitude", "family__name"]
    output_serializer_class = TasteFamilyPreferenceSerializer
    create_serializer_class = TasteFamilyPreferenceCreateSerializer

    def get_queryset(self):
        return family_preferences_for_user(self.request.user)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            item = TasteProfileService.create_family_preference(
                request.user,
                family_id=serializer.validated_data["family_id"],
                attitude=serializer.validated_data["attitude"],
                comment=serializer.validated_data.get("comment", ""),
            )
        except TasteProfileError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.serialize_output(item), status=status.HTTP_201_CREATED)


class TasteFamilyPreferenceDetailView(BaseTastePreferenceDetailView):
    output_serializer_class = TasteFamilyPreferenceSerializer
    update_serializer_class = TasteFamilyPreferenceUpdateSerializer

    def patch(self, request, item_id: int):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            item = TasteProfileService.update_family_preference(
                request.user,
                item_id,
                data=serializer.validated_data,
            )
        except TasteProfileError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.serialize_output(item), status=status.HTTP_200_OK)

    def delete(self, request, item_id: int):
        deleted = TasteProfileService.delete_family_preference(request.user, item_id)

        if not deleted:
            return Response({"detail": "Р•Р»РµРјРµРЅС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)


class TasteNotePreferenceListCreateView(BaseTastePreferenceListCreateView):
    filterset_class = TasteNotePreferenceFilter
    search_fields = ["comment", "note__name", "note__slug"]
    ordering_fields = ["created_at", "updated_at", "attitude", "note__name"]
    output_serializer_class = TasteNotePreferenceSerializer
    create_serializer_class = TasteNotePreferenceCreateSerializer

    def get_queryset(self):
        return note_preferences_for_user(self.request.user)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            item = TasteProfileService.create_note_preference(
                request.user,
                note_id=serializer.validated_data["note_id"],
                attitude=serializer.validated_data["attitude"],
                comment=serializer.validated_data.get("comment", ""),
            )
        except TasteProfileError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.serialize_output(item), status=status.HTTP_201_CREATED)


class TasteNotePreferenceDetailView(BaseTastePreferenceDetailView):
    output_serializer_class = TasteNotePreferenceSerializer
    update_serializer_class = TasteNotePreferenceUpdateSerializer

    def patch(self, request, item_id: int):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            item = TasteProfileService.update_note_preference(
                request.user,
                item_id,
                data=serializer.validated_data,
            )
        except TasteProfileError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.serialize_output(item), status=status.HTTP_200_OK)

    def delete(self, request, item_id: int):
        deleted = TasteProfileService.delete_note_preference(request.user, item_id)

        if not deleted:
            return Response({"detail": "Р•Р»РµРјРµРЅС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)


class TastePerfumerPreferenceListCreateView(BaseTastePreferenceListCreateView):
    filterset_class = TastePerfumerPreferenceFilter
    search_fields = ["comment", "perfumer__name"]
    ordering_fields = ["created_at", "updated_at", "attitude", "perfumer__name"]
    output_serializer_class = TastePerfumerPreferenceSerializer
    create_serializer_class = TastePerfumerPreferenceCreateSerializer

    def get_queryset(self):
        return perfumer_preferences_for_user(self.request.user)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            item = TasteProfileService.create_perfumer_preference(
                request.user,
                perfumer_id=serializer.validated_data["perfumer_id"],
                attitude=serializer.validated_data["attitude"],
                comment=serializer.validated_data.get("comment", ""),
            )
        except TasteProfileError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.serialize_output(item), status=status.HTTP_201_CREATED)


class TastePerfumerPreferenceDetailView(BaseTastePreferenceDetailView):
    output_serializer_class = TastePerfumerPreferenceSerializer
    update_serializer_class = TastePerfumerPreferenceUpdateSerializer

    def patch(self, request, item_id: int):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            item = TasteProfileService.update_perfumer_preference(
                request.user,
                item_id,
                data=serializer.validated_data,
            )
        except TasteProfileError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.serialize_output(item), status=status.HTTP_200_OK)

    def delete(self, request, item_id: int):
        deleted = TasteProfileService.delete_perfumer_preference(request.user, item_id)

        if not deleted:
            return Response({"detail": "Р•Р»РµРјРµРЅС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)


class TasteBrandPreferenceListCreateView(BaseTastePreferenceListCreateView):
    filterset_class = TasteBrandPreferenceFilter
    search_fields = ["comment", "brand__name", "brand__slug", "brand__country"]
    ordering_fields = ["created_at", "updated_at", "attitude", "brand__name"]
    output_serializer_class = TasteBrandPreferenceSerializer
    create_serializer_class = TasteBrandPreferenceCreateSerializer

    def get_queryset(self):
        return brand_preferences_for_user(self.request.user)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            item = TasteProfileService.create_brand_preference(
                request.user,
                brand_id=serializer.validated_data["brand_id"],
                attitude=serializer.validated_data["attitude"],
                comment=serializer.validated_data.get("comment", ""),
            )
        except TasteProfileError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.serialize_output(item), status=status.HTTP_201_CREATED)


class TasteBrandPreferenceDetailView(BaseTastePreferenceDetailView):
    output_serializer_class = TasteBrandPreferenceSerializer
    update_serializer_class = TasteBrandPreferenceUpdateSerializer

    def patch(self, request, item_id: int):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            item = TasteProfileService.update_brand_preference(
                request.user,
                item_id,
                data=serializer.validated_data,
            )
        except TasteProfileError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.serialize_output(item), status=status.HTTP_200_OK)

    def delete(self, request, item_id: int):
        deleted = TasteProfileService.delete_brand_preference(request.user, item_id)

        if not deleted:
            return Response({"detail": "Р•Р»РµРјРµРЅС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)


class TasteSeasonPreferenceListCreateView(BaseTastePreferenceListCreateView):
    filterset_class = TasteSeasonPreferenceFilter
    search_fields = ["comment", "season"]
    ordering_fields = ["created_at", "updated_at", "attitude", "season"]
    output_serializer_class = TasteSeasonPreferenceSerializer
    create_serializer_class = TasteSeasonPreferenceCreateSerializer

    def get_queryset(self):
        return season_preferences_for_user(self.request.user)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item = TasteProfileService.create_season_preference(
            request.user,
            season=serializer.validated_data["season"],
            attitude=serializer.validated_data["attitude"],
            comment=serializer.validated_data.get("comment", ""),
        )

        return Response(self.serialize_output(item), status=status.HTTP_201_CREATED)


class TasteSeasonPreferenceDetailView(BaseTastePreferenceDetailView):
    output_serializer_class = TasteSeasonPreferenceSerializer
    update_serializer_class = TasteSeasonPreferenceUpdateSerializer

    def patch(self, request, item_id: int):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            item = TasteProfileService.update_season_preference(
                request.user,
                item_id,
                data=serializer.validated_data,
            )
        except TasteProfileError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.serialize_output(item), status=status.HTTP_200_OK)

    def delete(self, request, item_id: int):
        deleted = TasteProfileService.delete_season_preference(request.user, item_id)

        if not deleted:
            return Response({"detail": "Р•Р»РµРјРµРЅС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)


class TasteConcentrationPreferenceListCreateView(BaseTastePreferenceListCreateView):
    filterset_class = TasteConcentrationPreferenceFilter
    search_fields = ["comment", "concentration"]
    ordering_fields = ["created_at", "updated_at", "attitude", "concentration"]
    output_serializer_class = TasteConcentrationPreferenceSerializer
    create_serializer_class = TasteConcentrationPreferenceCreateSerializer

    def get_queryset(self):
        return concentration_preferences_for_user(self.request.user)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        item = TasteProfileService.create_concentration_preference(
            request.user,
            concentration=serializer.validated_data["concentration"],
            attitude=serializer.validated_data["attitude"],
            comment=serializer.validated_data.get("comment", ""),
        )

        return Response(self.serialize_output(item), status=status.HTTP_201_CREATED)


class TasteConcentrationPreferenceDetailView(BaseTastePreferenceDetailView):
    output_serializer_class = TasteConcentrationPreferenceSerializer
    update_serializer_class = TasteConcentrationPreferenceUpdateSerializer

    def patch(self, request, item_id: int):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            item = TasteProfileService.update_concentration_preference(
                request.user,
                item_id,
                data=serializer.validated_data,
            )
        except TasteProfileError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.serialize_output(item), status=status.HTTP_200_OK)

    def delete(self, request, item_id: int):
        deleted = TasteProfileService.delete_concentration_preference(request.user, item_id)

        if not deleted:
            return Response({"detail": "Р•Р»РµРјРµРЅС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)


class TasteFragranceMarkListCreateView(BaseTastePreferenceListCreateView):
    filterset_class = TasteFragranceMarkFilter
    search_fields = ["comment", "fragrance__name", "fragrance__brand__name", "fragrance__slug"]
    ordering_fields = [
        "created_at",
        "updated_at",
        "mark",
        "priority",
        "fragrance__name",
        "fragrance__brand__name",
    ]
    output_serializer_class = TasteFragranceMarkSerializer
    create_serializer_class = TasteFragranceMarkCreateSerializer

    def get_queryset(self):
        return fragrance_marks_for_user(self.request.user)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            item = TasteProfileService.create_fragrance_mark(
                request.user,
                fragrance_id=serializer.validated_data["fragrance_id"],
                mark=serializer.validated_data["mark"],
                priority=serializer.validated_data.get("priority"),
                comment=serializer.validated_data.get("comment", ""),
            )
        except TasteProfileError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.serialize_output(item), status=status.HTTP_201_CREATED)


class TasteFragranceMarkDetailView(BaseTastePreferenceDetailView):
    output_serializer_class = TasteFragranceMarkSerializer
    update_serializer_class = TasteFragranceMarkUpdateSerializer

    def patch(self, request, item_id: int):
        serializer = self.get_serializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            item = TasteProfileService.update_fragrance_mark(
                request.user,
                item_id,
                data=serializer.validated_data,
            )
        except TasteProfileError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(self.serialize_output(item), status=status.HTTP_200_OK)

    def delete(self, request, item_id: int):
        deleted = TasteProfileService.delete_fragrance_mark(request.user, item_id)

        if not deleted:
            return Response({"detail": "Р•Р»РµРјРµРЅС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."}, status=status.HTTP_404_NOT_FOUND)

        return Response(status=status.HTTP_204_NO_CONTENT)
