from django.db import models

class STATUS_CHOISE(models.TextChoices):
    PENDING = 'pending', 'РћС‡С–РєСѓС” РјРѕРґРµСЂР°С†С–С—'
    APPROVED = 'approved', 'РЎС…РІР°Р»РµРЅРѕ'
    REJECTED = 'rejected', 'Р’С–РґС…РёР»РµРЅРѕ РјРѕРґРµСЂР°С‚РѕСЂРѕРј'
    HIDDEN_BY_OWNER = 'hidden', 'РџСЂРёС…РѕРІР°РЅРѕ РІР»Р°СЃРЅРёРєРѕРј'
    REMOVED_BY_MODERATOR = 'removed_by_moderator', 'Р’РёРґР°Р»РµРЅРѕ РјРѕРґРµСЂР°С‚РѕСЂРѕРј'

class REMOVAL_REASON_CHOISE(models.TextChoices):
    COUNTERFEIT_SUSPECT = 'counterfeit', 'РџС–РґРѕР·СЂР° РЅР° РїС–РґСЂРѕР±РєСѓ'
    VIOLATES_RULES = 'rules_violation', 'РџРѕСЂСѓС€РµРЅРЅСЏ РїСЂР°РІРёР»'
    INAPPROPRIATE_CONTENT = 'inappropriate', 'РќРµРїСЂРёР№РЅСЏС‚РЅРёР№ РІРјС–СЃС‚'
    OTHER = 'other', 'Р†РЅС€Рµ'
