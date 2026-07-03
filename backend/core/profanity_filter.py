from __future__ import annotations

import re
from dataclasses import dataclass


DEFAULT_PROFANITY_PATTERNS = (
    r"(?<!\w)сука(?!\w)",
    r"(?<!\w)бляд[а-яіїєґ]*(?!\w)",
    r"(?<!\w)хуй[а-яіїєґ]*(?!\w)",
    r"(?<!\w)пизд[а-яіїєґ]*(?!\w)",
    r"СЃСѓРєР°",
    r"Р±Р»СЏРґ[Р°-СЏС–С—С”Т‘]*",
    r"С…СѓР№[Р°-СЏС–С—С”Т‘]*",
    r"РїРёР·Рґ[Р°-СЏС–С—С”Т‘]*",
)


@dataclass(frozen=True)
class ProfanityFilterResult:
    original: str
    censored: str
    has_profanity: bool


def censor_profanity(text: str | None) -> ProfanityFilterResult:
    original = text or ""
    censored = original

    for pattern in DEFAULT_PROFANITY_PATTERNS:
        censored = re.sub(pattern, "****", censored, flags=re.IGNORECASE)

    return ProfanityFilterResult(
        original=original,
        censored=censored,
        has_profanity=censored != original,
    )
