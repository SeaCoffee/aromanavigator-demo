from django.db import models


class TasteAttitude(models.TextChoices):
    LIKE = "like", "РџРѕРґРѕР±Р°С”С‚СЊСЃСЏ"
    DISLIKE = "dislike", "РќРµ РїРѕРґРѕР±Р°С”С‚СЊСЃСЏ"


class TasteSeason(models.TextChoices):
    SPRING = "spring", "Р’РµСЃРЅР°"
    SUMMER = "summer", "Р›С–С‚Рѕ"
    AUTUMN = "autumn", "РћСЃС–РЅСЊ"
    WINTER = "winter", "Р—РёРјР°"
    ALL_SEASON = "all_season", "Р‘СѓРґСЊ-СЏРєРёР№ СЃРµР·РѕРЅ"


class TasteConcentration(models.TextChoices):
    EDC = "edc", "Eau de Cologne"
    EDT = "edt", "Eau de Toilette"
    EDP = "edp", "Eau de Parfum"
    PARFUM = "parfum", "Parfum"
    EXTRAIT = "extrait", "Extrait de Parfum"
    OIL = "oil", "Perfume Oil"
    MIST = "mist", "Mist"


class TasteFragranceMark(models.TextChoices):
    LOOKING_FOR = "looking_for", "Р—Р°СЂР°Р· С€СѓРєР°СЋ"
    DO_NOT_OFFER = "do_not_offer", "РќРµ РїСЂРѕРїРѕРЅСѓРІР°С‚Рё"


class TastePriority(models.TextChoices):
    LOW = "low", "РќРёР·СЊРєРёР№"
    NORMAL = "normal", "Р—РІРёС‡Р°Р№РЅРёР№"
    HIGH = "high", "Р’РёСЃРѕРєРёР№"
