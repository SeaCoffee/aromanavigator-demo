from django.db import models

class PHOTO_TYPE_CHOICES(models.TextChoices):
    FULL = "full", "Р¤Р»Р°РєРѕРЅ Р·Р°РіР°Р»СЊРЅРёРј РїР»Р°РЅРѕРј"
    BOTTOM = "bottom", "Р”РЅРѕ С„Р»Р°РєРѕРЅР°"
    SPRAYER = "sprayer", "Р РѕР·РїРёР»СЋРІР°С‡"
    LASER = "laser", "Р›Р°Р·РµСЂРЅРёР№ РєРѕРґ"
    COLLAGE = "collage", "РљРѕР»Р°Р¶"


class PHOTO_KIND_CHOICES(models.TextChoices):
    COVER = "cover", "РћР±РєР»Р°РґРёРЅРєР°"
    ATTACHMENT = "attachment", "Р’РєР»Р°РґРµРЅРЅСЏ"
