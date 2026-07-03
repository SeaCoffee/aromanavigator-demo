from __future__ import annotations

import logging
from collections.abc import Iterable

from django.db import transaction

from apps.users.models import ProfileModel

from .models import MentionModel
from .selectors import mention_content_type_for_object
from .utils import normalize_mention_name


logger = logging.getLogger(__name__)


def normalize_mention_names(usernames: Iterable[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()

    for raw in usernames or []:
        name = normalize_mention_name(raw)

        if not name or name in seen:
            continue

        seen.add(name)
        result.append(name)

    return result


def resolve_mentioned_user_ids(
    *,
    usernames: Iterable[str],
    exclude_user_ids: set[int] | None = None,
) -> set[int]:
    names = normalize_mention_names(usernames)

    if not names:
        return set()

    excluded = set(exclude_user_ids or set())

    qs = (
        ProfileModel.objects
        .filter(
            display_name_ci__in=names,
            user__is_active=True,
        )
        .exclude(user_id__in=excluded)
        .values_list("user_id", flat=True)
    )

    return {
        int(user_id)
        for user_id in qs
        if user_id
    }


@transaction.atomic
def sync_mentions_for_object(
    *,
    obj,
    usernames: Iterable[str],
    exclude_user_ids: set[int] | None = None,
) -> set[int]:
    """
    РџСЂРёРІРѕРґРёС‚ mentions РѕР±СЉРµРєС‚Р° Рє СЂРѕРІРЅРѕ Р°РєС‚СѓР°Р»СЊРЅРѕРјСѓ СЃРїРёСЃРєСѓ.

    Р’Р°Р¶РЅРѕ:
    - РґРѕР±Р°РІР»СЏРµС‚ РЅРѕРІС‹Рµ mentions;
    - СѓРґР°Р»СЏРµС‚ СЃС‚Р°СЂС‹Рµ mentions, РєРѕС‚РѕСЂС‹С… Р±РѕР»СЊС€Рµ РЅРµС‚ РІ С‚РµРєСЃС‚Рµ;
    - РµСЃР»Рё usernames РїСѓСЃС‚РѕР№, РѕС‡РёС‰Р°РµС‚ РІСЃРµ mentions РѕР±СЉРµРєС‚Р°.
    """

    if not obj.pk:
        raise ValueError("Object must be saved before syncing mentions.")

    content_type = mention_content_type_for_object(obj)

    desired_user_ids = resolve_mentioned_user_ids(
        usernames=usernames,
        exclude_user_ids=exclude_user_ids,
    )

    current_user_ids = set(
        MentionModel.objects
        .filter(content_type=content_type, object_id=obj.pk)
        .values_list("user_id", flat=True)
    )

    to_delete = current_user_ids - desired_user_ids
    to_create = desired_user_ids - current_user_ids

    if to_delete:
        MentionModel.objects.filter(
            content_type=content_type,
            object_id=obj.pk,
            user_id__in=to_delete,
        ).delete()

    if to_create:
        MentionModel.objects.bulk_create(
            [
                MentionModel(
                    content_type=content_type,
                    object_id=obj.pk,
                    user_id=user_id,
                )
                for user_id in to_create
            ],
            ignore_conflicts=True,
        )

    return desired_user_ids


@transaction.atomic
def clear_mentions_for_object(*, obj) -> None:
    if not obj.pk:
        return

    content_type = mention_content_type_for_object(obj)

    MentionModel.objects.filter(
        content_type=content_type,
        object_id=obj.pk,
    ).delete()
