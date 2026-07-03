# core/serializers/target_reference.py

from __future__ import annotations

import json
import re
from typing import Any, Callable, Optional

from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers
from rest_framework.fields import empty


TARGET_STR_RE = re.compile(
    r"^(?P<app>[a-z_][a-z0-9_]*)\.(?P<model>[a-z_][a-z0-9_]*):(?P<id>\d+)$"
)


class TargetReferenceField(serializers.Field):
    """
    РљР°РЅРѕРЅРёС‡РµСЃРєРёРµ С„РѕСЂРјР°С‚С‹:

    1) JSON:
       {"target": {"app": "forum", "model": "forumtopicmodel", "id": 4}}

    2) multipart/form-data:
       target="forum.forumtopicmodel:4"

    3) JSON-string РІРЅСѓС‚СЂРё multipart:
       target='{"app":"forum","model":"forumtopicmodel","id":4}'

    Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅРѕ РїРѕРґРґРµСЂР¶РёРІР°РµРј Р°Р»РёР°СЃС‹:
       app_label -> app
       pk/object_id -> id

    Р’Р°Р¶РЅРѕ:
    - app/model РґРѕР»Р¶РЅС‹ СЃРѕРѕС‚РІРµС‚СЃС‚РІРѕРІР°С‚СЊ Django ContentType:
      ContentType.app_label Рё ContentType.model.
    - allow_ct РґРѕР»Р¶РµРЅ РѕРіСЂР°РЅРёС‡РёРІР°С‚СЊ СЂР°Р·СЂРµС€С‘РЅРЅС‹Рµ РјРѕРґРµР»Рё РґР»СЏ РїСѓР±Р»РёС‡РЅС‹С… write endpoints.
    """

    default_error_messages = {
        "required": "Target РѕР±РѕРІ'СЏР·РєРѕРІРёР№.",
        "not_found": "РћР±'С”РєС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.",
        "invalid": "РќРµРІС–СЂРЅРёР№ С„РѕСЂРјР°С‚ target.",
        "not_allowed": "Р¦РµР№ С‚РёРї РѕР±'С”РєС‚Р° РЅРµ РїС–РґС‚СЂРёРјСѓС”С‚СЊСЃСЏ.",
    }

    def __init__(
        self,
        *args,
        allow_ct: Optional[Callable[[ContentType], bool]] = None,
        **kwargs,
    ):
        super().__init__(*args, **kwargs)
        self._allow_ct = allow_ct

    def get_value(self, dictionary):
        """
        Р”Р°С‘С‚ РІРѕР·РјРѕР¶РЅРѕСЃС‚СЊ РїСЂРёРЅРёРјР°С‚СЊ РЅРµ С‚РѕР»СЊРєРѕ target=...,
        РЅРѕ Рё РїР»РѕСЃРєРёРµ РїРѕР»СЏ РІ multipart:

        target_app=forum
        target_model=forumtopicmodel
        target_id=4
        """
        value = super().get_value(dictionary)

        if value is not empty:
            return value

        flat_keys = {"target_app", "target_model", "target_id"}
        if flat_keys <= set(dictionary.keys()):
            return {
                "app": dictionary.get("target_app"),
                "model": dictionary.get("target_model"),
                "id": dictionary.get("target_id"),
            }

        alt_flat_keys = {"app", "model", "id"}
        if alt_flat_keys <= set(dictionary.keys()):
            return {
                "app": dictionary.get("app"),
                "model": dictionary.get("model"),
                "id": dictionary.get("id"),
            }

        return empty

    def _allowed(self, ct: ContentType) -> bool:
        if self._allow_ct is None:
            return True

        return bool(self._allow_ct(ct))

    def _get_ct(self, app: str, model: str) -> ContentType:
        try:
            return ContentType.objects.get_by_natural_key(app, model)
        except ContentType.DoesNotExist:
            self.fail("not_found")

    def _resolve_object(self, ct: ContentType, obj_id: Any):
        try:
            obj_id_int = int(obj_id)
        except (TypeError, ValueError):
            self.fail("invalid")

        if obj_id_int <= 0:
            self.fail("invalid")

        model_cls = ct.model_class()
        if model_cls is None:
            self.fail("not_found")

        try:
            return model_cls.objects.get(pk=obj_id_int)
        except model_cls.DoesNotExist:
            self.fail("not_found")

    def _coerce_payload(self, data: Any) -> dict[str, Any]:
        if data is empty:
            self.fail("required")

        if isinstance(data, str):
            value = data.strip()

            if not value:
                self.fail("invalid")

            if value.startswith("{"):
                try:
                    data = json.loads(value)
                except json.JSONDecodeError:
                    self.fail("invalid")

                if not isinstance(data, dict):
                    self.fail("invalid")
            else:
                match = TARGET_STR_RE.match(value)

                if not match:
                    self.fail("invalid")

                return {
                    "app": match.group("app"),
                    "model": match.group("model"),
                    "id": match.group("id"),
                }

        if not isinstance(data, dict):
            self.fail("invalid")

        if "target" in data and isinstance(data["target"], dict):
            data = data["target"]

        app = data.get("app") or data.get("app_label")
        model = data.get("model")
        obj_id = data.get("id") or data.get("pk") or data.get("object_id")

        if not app or not model or not obj_id:
            self.fail("invalid")

        return {
            "app": str(app).strip().lower(),
            "model": str(model).strip().lower(),
            "id": obj_id,
        }

    def to_internal_value(self, data: Any):
        payload = self._coerce_payload(data)

        ct = self._get_ct(payload["app"], payload["model"])

        if not self._allowed(ct):
            self.fail("not_allowed")

        return self._resolve_object(ct, payload["id"])

    def to_representation(self, value):
        if value is None:
            return None

        meta = value._meta

        return {
            "app": meta.app_label,
            "model": meta.model_name,
            "id": value.pk,
        }
