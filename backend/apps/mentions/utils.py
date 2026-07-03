from __future__ import annotations

import re


MENTION_MAX_LENGTH = 30

MENTION_RE = re.compile(
    r"(?<![\w@])@(\w{2,30})",
    flags=re.UNICODE,
)


def normalize_mention_name(value: str) -> str:
    return str(value or "").strip().lstrip("@").casefold()


def extract_mentions(text: str, *, max_mentions: int = 20) -> list[str]:
    """
    Р’РѕР·РІСЂР°С‰Р°РµС‚ СѓРЅРёРєР°Р»СЊРЅС‹Рµ mention names Р±РµР· @, РІ РїРѕСЂСЏРґРєРµ РїРѕСЏРІР»РµРЅРёСЏ.
    """

    if not text:
        return []

    result: list[str] = []
    seen: set[str] = set()

    for match in MENTION_RE.finditer(text):
        name = normalize_mention_name(match.group(1))

        if not name or name in seen:
            continue

        seen.add(name)
        result.append(name)

        if len(result) >= max_mentions:
            break

    return result
