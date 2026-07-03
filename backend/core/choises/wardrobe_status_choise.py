from django.db import models

class WardrobeStatus(models.TextChoices):
    OWN = "own", "РњР°СЋ"
    WANT = "want", "РҐРѕС‡Сѓ"
    HAD = "had", "Р‘СѓРІ СЂР°РЅС–С€Рµ"
    SAMPLE = "sample", "РњР°СЋ РїСЂРѕР±РЅРёРє"
    FAVORITE = "favorite", "РЈР»СЋР±Р»РµРЅРёР№"
