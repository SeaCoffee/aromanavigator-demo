from enum import Enum

class DisplayNameRegexEnum(Enum):
    MIN_LENGTH = (
        r'.{3,}',
        'Display name must be at least 3 characters long.'
    )
    ALLOWED_CHARS = (
        r'^[\w.@+-]+$',
        'Display name can only contain letters, numbers, underscores, and symbols . @ + -'
    )
    FORBIDDEN_WORDS = (
        r'^(?!.*\b(admin|moderator|support)\b).*$',
        'Display name contains reserved words.'
    )

    def __init__(self, pattern: str, msg: str):
        self.pattern = pattern
        self.msg = msg


class NameRegexEnum(Enum):
    # 2..25 СЃРёРјРІРѕР»РѕРІ (Сѓ С‚РµР±СЏ max_length=25)
    LENGTH = (
        r"^.{2,25}$",
        "Name must be 2вЂ“25 characters long.",
    )
    # Р Р°Р·СЂРµС€РёРј Р±СѓРєРІС‹ (РІ С‚.С‡. РєРёСЂРёР»Р»РёС†Сѓ), РїСЂРѕР±РµР», РґРµС„РёСЃ, Р°РїРѕСЃС‚СЂРѕС„.
    # Р•СЃР»Рё С…РѕС‡РµС€СЊ РўРћР›Р¬РљРћ Р»Р°С‚РёРЅРёС†Сѓ вЂ” СЃРєР°Р¶Рё, РїРѕРјРµРЅСЏРµРј.
    ALLOWED_CHARS = (
        r"^[^\W\d_]+([ '-][^\W\d_]+)*$",
        "Name can contain only letters, spaces, hyphens, and apostrophes.",
    )

    def __init__(self, pattern: str, msg: str):
        self.pattern = pattern
        self.msg = msg
