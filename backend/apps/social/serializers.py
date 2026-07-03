from __future__ import annotations

from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.social.models import SubscriptionModel
from apps.social.subscriptions_policy import allow_subscription_ct
from apps.users.serializers import ProfileMeSerializer, UserStatsSerializer
from core.serializers.target_reference import TargetReferenceField


User = get_user_model()


class SocialUserSerializer(serializers.ModelSerializer):
    profile = ProfileMeSerializer(read_only=True)
    stats = UserStatsSerializer(read_only=True)

    class Meta:
        model = User
        fields = ("id", "profile", "stats")
        read_only_fields = fields


class SocialCountsSerializer(serializers.Serializer):
    followers_count = serializers.IntegerField()
    following_count = serializers.IntegerField()


class FollowToggleResponseSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=("followed", "unfollowed"))
    me = SocialCountsSerializer()
    target = SocialCountsSerializer()


class BlockToggleResponseSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=("blocked", "unblocked"))
    me = SocialCountsSerializer()
    target = SocialCountsSerializer()


class SubscriptionMutationSerializer(serializers.Serializer):
    target = TargetReferenceField(allow_ct=allow_subscription_ct)


class SubscribeSerializer(SubscriptionMutationSerializer):
    pass


class UnsubscribeSerializer(SubscriptionMutationSerializer):
    pass


class SubscriptionOutSerializer(serializers.ModelSerializer):
    item = serializers.SerializerMethodField()

    class Meta:
        model = SubscriptionModel
        fields = ("id", "created_at", "item")
        read_only_fields = fields

    def get_item(self, obj: SubscriptionModel):
        ct = obj.content_type
        target = obj.content_object

        if not target:
            return {
                "app": ct.app_label,
                "model": ct.model,
                "id": obj.object_id,
                "label": None,
                "is_deleted": True,
            }

        return {
            "app": ct.app_label,
            "model": ct.model,
            "id": target.pk,
            "label": self._get_target_label(target),
            "is_deleted": False,
        }

    def _get_target_label(self, target) -> str:
        for attr in ("title", "name", "display_name"):
            value = getattr(target, attr, None)

            if value:
                return str(value)

        return str(target)


class SocialStateSerializer(serializers.Serializer):
    is_following = serializers.BooleanField()
    is_blocked_by_me = serializers.BooleanField()
    is_blocked_between = serializers.BooleanField()
