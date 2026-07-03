import re
from django.core.exceptions import ValidationError
from core.enums.password_enum import PasswordRegexEnum


def validate_password(value: str) -> str:
    v = value or ""
    # РїРѕСЃР»РµРґРѕРІР°С‚РµР»СЊРЅР°СЏ РїСЂРѕРІРµСЂРєР° вЂ” С‡С‚РѕР±С‹ С„СЂРѕРЅС‚ РјРѕРі РїРѕРєР°Р·Р°С‚СЊ С‚РѕС‡РЅСѓСЋ РїРѕРґСЃРєР°Р·РєСѓ
    for rule in PasswordRegexEnum:
        if not re.fullmatch(rule.pattern, v) and rule is PasswordRegexEnum.LENGTH_NO_SPACE:
            raise ValidationError(rule.msg)
        if rule is not PasswordRegexEnum.LENGTH_NO_SPACE and not re.search(rule.pattern, v):
            raise ValidationError(rule.msg)

    return v
