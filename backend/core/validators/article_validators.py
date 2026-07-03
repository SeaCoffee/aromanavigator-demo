from rest_framework import serializers

from core.choises.article_status_choise import ArticleStatus


ARTICLE_TITLE_MAX_LENGTH = 200
ARTICLE_CONTENT_MAX_LENGTH = 30_000
ARTICLE_TAG_MAX_LENGTH = 50
ARTICLE_TAGS_MAX_COUNT = 12
ARTICLE_MODERATOR_COMMENT_MAX_LENGTH = 1_000

AUTHOR_ALLOWED_STATUSES = {
    ArticleStatus.DRAFT,
    ArticleStatus.PENDING,
}


def normalize_text(value: str | None) -> str:
    return " ".join(str(value or "").split()).strip()


def validate_article_title(value: str) -> str:
    title = normalize_text(value)

    if not title:
        raise serializers.ValidationError("Р’РєР°Р¶С–С‚СЊ Р·Р°РіРѕР»РѕРІРѕРє СЃС‚Р°С‚С‚С–.")

    if len(title) > ARTICLE_TITLE_MAX_LENGTH:
        raise serializers.ValidationError(
            f"Р—Р°РіРѕР»РѕРІРѕРє РјР°С” Р±СѓС‚Рё РЅРµ РґРѕРІС€РёР№ Р·Р° {ARTICLE_TITLE_MAX_LENGTH} СЃРёРјРІРѕР»С–РІ."
        )

    return title


def validate_article_content(value: str) -> str:
    content = str(value or "").strip()

    if not content:
        raise serializers.ValidationError("Р”РѕРґР°Р№С‚Рµ С‚РµРєСЃС‚ СЃС‚Р°С‚С‚С–.")

    if len(content) > ARTICLE_CONTENT_MAX_LENGTH:
        raise serializers.ValidationError(
            f"РўРµРєСЃС‚ СЃС‚Р°С‚С‚С– РјР°С” Р±СѓС‚Рё РЅРµ РґРѕРІС€РёР№ Р·Р° {ARTICLE_CONTENT_MAX_LENGTH} СЃРёРјРІРѕР»С–РІ."
        )

    return content


def validate_author_article_status(value: str) -> str:
    if value not in AUTHOR_ALLOWED_STATUSES:
        raise serializers.ValidationError(
            "РђРІС‚РѕСЂ РјРѕР¶Рµ Р·Р±РµСЂРµРіС‚Рё СЃС‚Р°С‚С‚СЋ Р»РёС€Рµ СЏРє С‡РµСЂРЅРµС‚РєСѓ Р°Р±Рѕ РІС–РґРїСЂР°РІРёС‚Рё РЅР° РјРѕРґРµСЂР°С†С–СЋ."
        )

    return value


def validate_tag_name(value: str) -> str:
    name = normalize_text(value)

    if not name:
        raise serializers.ValidationError("РџРѕСЂРѕР¶РЅС–Р№ С‚РµРі РЅРµ РґРѕРїСѓСЃРєР°С”С‚СЊСЃСЏ.")

    if len(name) > ARTICLE_TAG_MAX_LENGTH:
        raise serializers.ValidationError(
            f"РўРµРі РјР°С” Р±СѓС‚Рё РЅРµ РґРѕРІС€РёР№ Р·Р° {ARTICLE_TAG_MAX_LENGTH} СЃРёРјРІРѕР»С–РІ."
        )

    return name


def validate_tag_names(value: list[str] | None) -> list[str]:
    if value is None:
        return []

    normalized: list[str] = []
    seen: set[str] = set()

    for raw_name in value:
        name = validate_tag_name(raw_name)
        key = name.casefold()

        if key in seen:
            continue

        seen.add(key)
        normalized.append(name)

    if len(normalized) > ARTICLE_TAGS_MAX_COUNT:
        raise serializers.ValidationError(
            f"РњР°РєСЃРёРјР°Р»СЊРЅР° РєС–Р»СЊРєС–СЃС‚СЊ С‚РµРіС–РІ: {ARTICLE_TAGS_MAX_COUNT}."
        )

    return normalized


def validate_moderator_comment(value: str | None) -> str:
    comment = str(value or "").strip()

    if len(comment) > ARTICLE_MODERATOR_COMMENT_MAX_LENGTH:
        raise serializers.ValidationError(
            f"РљРѕРјРµРЅС‚Р°СЂ РјРѕРґРµСЂР°С‚РѕСЂР° РјР°С” Р±СѓС‚Рё РЅРµ РґРѕРІС€РёР№ Р·Р° "
            f"{ARTICLE_MODERATOR_COMMENT_MAX_LENGTH} СЃРёРјРІРѕР»С–РІ."
        )

    return comment
