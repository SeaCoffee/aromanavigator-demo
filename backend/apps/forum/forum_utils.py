
from django.utils.text import slugify
from django.core.exceptions import ValidationError as DjangoValidationError
from collections import defaultdict
from django.contrib.contenttypes.models import ContentType

from .models import ForumTopicModel
from apps.tags.models import TaggedItemModel
from apps.likes.models import LikeModel

def _clean_text(s: str, *, max_len: int | None = None) -> str:
    s = (s or "").strip()
    if not s:
        raise DjangoValidationError("РџРѕР»Рµ РЅРµ РјРѕР¶Рµ Р±СѓС‚Рё РїРѕСЂРѕР¶РЅС–Рј")
    if max_len is not None and len(s) > max_len:
        raise DjangoValidationError(f"РњР°РєСЃРёРјСѓРј {max_len} СЃРёРјРІРѕР»С–РІ")
    return s


def _unique_slug(model, title: str, max_len: int) -> str:
    base = slugify(title) or "item"
    base = base[:max_len]
    slug = base
    i = 2
    qs = model._default_manager.all()

    while qs.filter(slug=slug).exists():
        suffix = f"-{i}"
        slug = f"{base[: max_len - len(suffix)]}{suffix}"
        i += 1
    return slug

def build_topic_tags_map(topic_ids: list[int]) -> dict[int, list[str]]:
    if not topic_ids:
        return {}

    ct_topic = ContentType.objects.get_for_model(ForumTopicModel, for_concrete_model=False)
    rows = (
        TaggedItemModel.objects
        .filter(content_type=ct_topic, object_id__in=topic_ids)
        .select_related("tag")
        .values_list("object_id", "tag__code")
    )

    tags_map = defaultdict(list)
    for object_id, tag_code in rows:
        if tag_code:
            tags_map[int(object_id)].append(str(tag_code))
    return dict(tags_map)


def build_liked_topic_ids_map(user, topic_ids: list[int]) -> set[int]:
    """
    Р’РѕР·РІСЂР°С‰Р°РµС‚ set topic_id, РєРѕС‚РѕСЂС‹Рµ Р»Р°Р№РєРЅСѓР» С‚РµРєСѓС‰РёР№ user.
    """
    if not topic_ids:
        return set()
    if not user or not getattr(user, "is_authenticated", False):
        return set()

    ct_topic = ContentType.objects.get_for_model(ForumTopicModel, for_concrete_model=False)

    return set(
        LikeModel.objects
        .filter(user=user, content_type=ct_topic, object_id__in=topic_ids)
        .values_list("object_id", flat=True)
    )
