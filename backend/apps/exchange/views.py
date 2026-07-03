from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView

from apps.exchange.exchange_service import ExchangeService
from apps.exchange.filters import ExchangeProposalFilter
from apps.exchange.selectors import (
    exchange_form_items_for_user,
    exchange_visible_to_user_queryset,
    pending_received_exchange_queryset,
    pending_sent_exchange_queryset,
    received_exchanges_for_user,
    sent_exchanges_for_user,
)
from apps.exchange.serializers import (
    ExchangeAcceptSerializer,
    ExchangeCancelSerializer,
    ExchangeCreateSerializer,
    ExchangeFormItemSerializer,
    ExchangeProposalSerializer,
    ExchangeRejectSerializer,
    ExchangeCreateFormQuerySerializer,
    ExchangeCreateFormResponseSerializer,
)
from core.pagination import PagePagination
from apps.exchange.create_form_service import ExchangeCreateFormService


class ExchangeCreateView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExchangeCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        proposal = serializer.save()

        return Response(
            ExchangeProposalSerializer(
                proposal,
                context=self.get_serializer_context(),
            ).data,
            status=status.HTTP_201_CREATED,
        )


class MyExchangeSentListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExchangeProposalSerializer
    pagination_class = PagePagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ExchangeProposalFilter
    ordering_fields = ["created_at", "updated_at", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return sent_exchanges_for_user(self.request.user)


class MyExchangeReceivedListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExchangeProposalSerializer
    pagination_class = PagePagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ExchangeProposalFilter
    ordering_fields = ["created_at", "updated_at", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return received_exchanges_for_user(self.request.user)


class ExchangeDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExchangeProposalSerializer

    def get_queryset(self):
        return exchange_visible_to_user_queryset(self.request.user)


class ExchangeAcceptView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExchangeAcceptSerializer
    http_method_names = ["patch"]

    def get_queryset(self):
        return pending_received_exchange_queryset(self.request.user)

    def patch(self, request, *args, **kwargs):
        proposal = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated = ExchangeService.accept(
            owner=request.user,
            proposal=proposal,
            accepted_items=serializer.validated_data["accepted_items"],
            decision_note=serializer.validated_data.get("decision_note", ""),
        )

        return Response(
            ExchangeProposalSerializer(
                updated,
                context=self.get_serializer_context(),
            ).data
        )


class ExchangeRejectView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExchangeRejectSerializer
    http_method_names = ["patch"]

    def get_queryset(self):
        return pending_received_exchange_queryset(self.request.user)

    def patch(self, request, *args, **kwargs):
        proposal = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated = ExchangeService.reject(
            owner=request.user,
            proposal=proposal,
            decision_note=serializer.validated_data.get("decision_note", ""),
        )

        return Response(
            ExchangeProposalSerializer(
                updated,
                context=self.get_serializer_context(),
            ).data
        )


class ExchangeCancelView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExchangeCancelSerializer
    http_method_names = ["patch"]

    def get_queryset(self):
        return pending_sent_exchange_queryset(self.request.user)

    def patch(self, request, *args, **kwargs):
        proposal = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated = ExchangeService.cancel(
            proposer=request.user,
            proposal=proposal,
            decision_note=serializer.validated_data.get("decision_note", ""),
        )

        return Response(
            ExchangeProposalSerializer(
                updated,
                context=self.get_serializer_context(),
            ).data
        )


class ExchangeFormItemsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        groups = exchange_form_items_for_user(request.user)

        return Response(
            {
                "wardrobe": ExchangeFormItemSerializer(
                    groups["wardrobe"],
                    many=True,
                    context={"request": request},
                ).data,
            }
        )

class ExchangeCreateFormView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query_serializer = ExchangeCreateFormQuerySerializer(
            data=request.query_params,
        )
        query_serializer.is_valid(raise_exception=True)

        form_data = ExchangeCreateFormService.get_data(
            user=request.user,
            requested_type=query_serializer.validated_data["requested_type"],
            requested_id=query_serializer.validated_data["requested_id"],
            owner_id=query_serializer.validated_data["owner_id"],
        )

        response_serializer = ExchangeCreateFormResponseSerializer(
            form_data,
            context={"request": request},
        )

        return Response(response_serializer.data)
