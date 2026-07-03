from __future__ import annotations

from rest_framework import serializers

from apps.users.author_display import public_user_display_name


def read_attr(obj, *names: str, default=""):
    for name in names:
        value = getattr(obj, name, None)

        if value not in (None, ""):
            return value

    return default


def serialize_brand(brand):
    if brand is None:
        return None

    if isinstance(brand, str):
        return brand

    return {
        "id": getattr(brand, "id", None),
        "name": getattr(brand, "name", ""),
        "slug": getattr(brand, "slug", ""),
    }


def serialize_author(author):
    if author is None:
        return None

    return {
        "id": getattr(author, "id", None),
        "display_name": public_user_display_name(author) or "РљРѕСЂРёСЃС‚СѓРІР°С‡",
    }


def read_image_url(obj) -> str:
    for field_name in (
        "cover_image",
        "image_url",
        "cover",
        "photo",
        "image",
        "avatar",
    ):
        value = getattr(obj, field_name, None)

        if not value:
            continue

        if isinstance(value, str):
            return value

        url = getattr(value, "url", "")

        if url:
            return url

    return ""


class FavoriteFragranceItemSerializer(serializers.Serializer):
    def to_representation(self, obj):
        meta = obj._meta
        brand = getattr(obj, "brand", None)

        name = read_attr(obj, "name", "title")
        title = name

        brand_name = ""
        if brand is not None:
            brand_name = getattr(brand, "name", "") if not isinstance(brand, str) else brand

        if brand_name and name:
            title = f"{brand_name} вЂ” {name}"

        return {
            "app": meta.app_label,
            "model": meta.model_name,
            "id": obj.pk,
            "title": title,
            "name": name,
            "slug": read_attr(obj, "slug"),
            "brand": serialize_brand(brand),
            "image_url": read_image_url(obj),
        }


class FavoriteForumTopicItemSerializer(serializers.Serializer):
    def to_representation(self, obj):
        meta = obj._meta
        section = getattr(obj, "section", None)
        author = getattr(obj, "author", None) or getattr(obj, "user", None)

        return {
            "app": meta.app_label,
            "model": meta.model_name,
            "id": obj.pk,
            "title": read_attr(obj, "title", "name"),
            "slug": read_attr(obj, "slug"),
            "section": (
                {
                    "id": getattr(section, "id", None),
                    "title": read_attr(section, "title", "name"),
                    "slug": read_attr(section, "slug"),
                }
                if section is not None
                else None
            ),
            "author": serialize_author(author),
            "comments_count": read_attr(obj, "comments_count", default=0),
            "image_url": read_image_url(obj),
        }
