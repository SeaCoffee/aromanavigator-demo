from django.urls import path

from apps.exchange.views import (
    ExchangeAcceptView,
    ExchangeCancelView,
    ExchangeCreateFormView,
    ExchangeCreateView,
    ExchangeDetailView,
    ExchangeFormItemsView,
    ExchangeRejectView,
    MyExchangeReceivedListView,
    MyExchangeSentListView,
)

urlpatterns = [
    path("", ExchangeCreateView.as_view(), name="exchange-create"),

    path("sent", MyExchangeSentListView.as_view(), name="exchange-sent"),
    path("received", MyExchangeReceivedListView.as_view(), name="exchange-received"),

    path("form-items", ExchangeFormItemsView.as_view(), name="exchange-form-items"),
    path("create-form", ExchangeCreateFormView.as_view(), name="exchange-create-form"),

    path("<int:pk>", ExchangeDetailView.as_view(), name="exchange-detail"),
    path("<int:pk>/accept", ExchangeAcceptView.as_view(), name="exchange-accept"),
    path("<int:pk>/reject", ExchangeRejectView.as_view(), name="exchange-reject"),
    path("<int:pk>/cancel", ExchangeCancelView.as_view(), name="exchange-cancel"),
]
