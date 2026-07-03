from django_filters import rest_framework as filters
from django.contrib.auth import get_user_model


UserModel = get_user_model()

class UserFilter(filters.FilterSet):
    email = filters.CharFilter(field_name="email", lookup_expr="icontains")
    is_active = filters.BooleanFilter(field_name="is_active")
    is_staff = filters.BooleanFilter(field_name="is_staff")
    created_at = filters.DateFromToRangeFilter(field_name="created_at")
    order = filters.OrderingFilter(fields=("id", "email", "created_at"))

    class Meta:
        model = UserModel
        fields = ["email", "is_active", "is_staff", "created_at"]


class PublicUserFilter(filters.FilterSet):
    created_at = filters.DateFromToRangeFilter(field_name="created_at")
    order = filters.OrderingFilter(fields=("id", "created_at"))

    class Meta:
        model = UserModel
        fields = ["created_at"]
