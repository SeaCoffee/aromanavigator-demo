from __future__ import annotations

from rest_framework import serializers

from .models import TagModel


class TagSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = TagModel
        fields = (
            "id",
            "code",
            "items_count",
        )
        read_only_fields = fields

    def get_items_count(self, obj: TagModel) -> int | None:
        return getattr(obj, "items_count", None)

class PopularTagSerializer(serializers.ModelSerializer):
    items_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = TagModel
        fields = (
            "id",
            "code",
            "items_count",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields
