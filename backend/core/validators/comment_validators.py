from __future__ import annotations

from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError

from apps.comments.constants import MAX_COMMENT_LEN, MAX_COMMENT_TREE_DEPTH
from apps.comments.models import CommentModel


def validate_comment_body(text: str) -> str:
    value = str(text or "").strip()

    if not value:
        raise ValidationError("РљРѕРјРµРЅС‚Р°СЂ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё РїРѕСЂРѕР¶РЅС–Рј.")

    if len(value) > MAX_COMMENT_LEN:
        raise ValidationError(f"РљРѕРјРµРЅС‚Р°СЂ: РјР°РєСЃРёРјСѓРј {MAX_COMMENT_LEN} СЃРёРјРІРѕР»С–РІ.")

    return value


def validate_target_can_receive_comments(target) -> None:
    if not target:
        raise ValidationError("РћР±'С”РєС‚ РєРѕРјРµРЅС‚СѓРІР°РЅРЅСЏ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.")

    app_label = target._meta.app_label
    model_name = target._meta.model_name

    if app_label == "articles" and model_name == "article":
        if getattr(target, "status", None) != "published":
            raise ValidationError(
                {"target": "РљРѕРјРµРЅС‚СѓРІР°С‚Рё РјРѕР¶РЅР° Р»РёС€Рµ РѕРїСѓР±Р»С–РєРѕРІР°РЅСѓ СЃС‚Р°С‚С‚СЋ."}
            )

    if app_label == "forum" and model_name == "forumtopicmodel":
        if getattr(target, "is_hidden", False):
            raise ValidationError({"target": "РўРµРјСѓ РїСЂРёС…РѕРІР°РЅРѕ."})

        if getattr(target, "is_locked", False):
            raise ValidationError({"target": "РўРµРјСѓ Р·Р°РєСЂРёС‚Рѕ РґР»СЏ РєРѕРјРµРЅС‚Р°СЂС–РІ."})


def _comment_depth(comment: CommentModel) -> int:
    depth = 1
    seen_ids = {comment.id}
    current = getattr(comment, "parent", None)

    while current is not None:
        if current.id in seen_ids:
            break

        depth += 1
        seen_ids.add(current.id)

        if depth >= MAX_COMMENT_TREE_DEPTH:
            return depth

        current = getattr(current, "parent", None)

    return depth


def validate_parent_comment(target, parent_id: int | None) -> CommentModel | None:
    if not parent_id:
        return None

    parent = (
        CommentModel.objects
        .select_related(
            "content_type",
            "parent",
            "user",
            "user__profile",
        )
        .filter(id=parent_id)
        .first()
    )

    if not parent:
        raise ValidationError({"parent_id": "Р‘Р°С‚СЊРєС–РІСЃСЊРєРёР№ РєРѕРјРµРЅС‚Р°СЂ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."})

    if parent.is_deleted:
        raise ValidationError({"parent_id": "РќРµ РјРѕР¶РЅР° РІС–РґРїРѕРІС–РґР°С‚Рё РЅР° РІРёРґР°Р»РµРЅРёР№ РєРѕРјРµРЅС‚Р°СЂ."})

    content_type = ContentType.objects.get_for_model(
        target,
        for_concrete_model=False,
    )

    if parent.content_type_id != content_type.id or parent.object_id != target.pk:
        raise ValidationError({
            "parent_id": "Р‘Р°С‚СЊРєС–РІСЃСЊРєРёР№ РєРѕРјРµРЅС‚Р°СЂ РјР°С” РЅР°Р»РµР¶Р°С‚Рё С‚РѕРјСѓ СЃР°РјРѕРјСѓ РѕР±'С”РєС‚Сѓ."
        })

    if _comment_depth(parent) >= MAX_COMMENT_TREE_DEPTH:
        raise ValidationError({
            "parent_id": f"РњР°РєСЃРёРјР°Р»СЊРЅР° РіР»РёР±РёРЅР° РіС–Р»РєРё РєРѕРјРµРЅС‚Р°СЂС–РІ: {MAX_COMMENT_TREE_DEPTH}."
        })

    return parent
