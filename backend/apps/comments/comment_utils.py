from django.contrib.contenttypes.models import ContentType

from apps.likes.models import LikeModel
from apps.comments.models import CommentModel

def build_liked_comment_ids(user, comment_ids: list[int]) -> set[int]:
    """
    Р’РѕР·РІСЂР°С‰Р°РµС‚ set comment_id, РєРѕС‚РѕСЂС‹Рµ Р»Р°Р№РєРЅСѓР» С‚РµРєСѓС‰РёР№ РїРѕР»СЊР·РѕРІР°С‚РµР»СЊ.
    """
    if not comment_ids:
        return set()
    if not user or not getattr(user, "is_authenticated", False):
        return set()

    ct_comment = ContentType.objects.get_for_model(CommentModel, for_concrete_model=False)
    return set(
        LikeModel.objects
        .filter(user=user, content_type=ct_comment, object_id__in=comment_ids)
        .values_list("object_id", flat=True)
    )


def flatten_thread_comment_ids(top_comments) -> list[int]:
    """
    РЎРѕР±РёСЂР°РµС‚ ids top-level + replies (prefetched_replies), С‡С‚РѕР±С‹ РѕРґРЅРёРј Р·Р°РїСЂРѕСЃРѕРј РїРѕР»СѓС‡РёС‚СЊ liked ids.
    """
    ids = []
    for c in top_comments:
        ids.append(c.id)
        replies = getattr(c, "prefetched_replies", None) or []
        for r in replies:
            ids.append(r.id)
    # СЃРѕС…СЂР°РЅРёС‚СЊ РїРѕСЂСЏРґРѕРє РЅРµ РєСЂРёС‚РёС‡РЅРѕ; СѓР±РёСЂР°РµРј РґСѓР±Р»Рё
    return list(dict.fromkeys(ids))




def build_comment_my_likes_map(user, comment_ids):
    """
    Р’РѕР·РІСЂР°С‰Р°РµС‚ dict[comment_id] = like_id РґР»СЏ С‚РµРєСѓС‰РµРіРѕ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ.
    """
    if not user or not getattr(user, "is_authenticated", False):
        return {}

    ids = [int(x) for x in (comment_ids or []) if x]
    if not ids:
        return {}

    ct = ContentType.objects.get_for_model(CommentModel, for_concrete_model=False)

    rows = (
        LikeModel.objects
        .filter(user=user, content_type=ct, object_id__in=ids)
        .values_list("object_id", "id")
    )
    return {object_id: like_id for object_id, like_id in rows}
