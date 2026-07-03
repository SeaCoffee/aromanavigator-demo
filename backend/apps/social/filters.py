from __future__ import annotations

from rest_framework import serializers

from apps.social.subscriptions_policy import is_allowed_target


class SubscriptionFilterSerializer(serializers.Serializer):
    app = serializers.CharField(required=False, allow_blank=False)
    model = serializers.CharField(required=False, allow_blank=False)
    id = serializers.IntegerField(required=False, min_value=1)

    def validate_app(self, value: str) -> str:
        return value.strip().lower()

    def validate_model(self, value: str) -> str:
        return value.strip().lower()

    def validate(self, attrs):
        app = attrs.get("app")
        model = attrs.get("model")
        object_id = attrs.get("id")

        has_any = app is not None or model is not None or object_id is not None
        has_all = app is not None and model is not None and object_id is not None

        if has_any and not has_all:
            raise serializers.ValidationError(
                "РџР°СЂР°РјРµС‚СЂРё app, model С‚Р° id РїРѕС‚СЂС–Р±РЅРѕ РїРµСЂРµРґР°РІР°С‚Рё СЂР°Р·РѕРј."
            )

        if has_all and not is_allowed_target(app, model):
            raise serializers.ValidationError(
                "РџС–РґРїРёСЃРєР° РЅР° С†РµР№ С‚РёРї РѕР±КјС”РєС‚Р° РЅРµ РїС–РґС‚СЂРёРјСѓС”С‚СЊСЃСЏ."
            )

        return attrs
