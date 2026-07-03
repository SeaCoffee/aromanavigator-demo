from django.db import models

class BRAND_CHOICES(models.TextChoices):
    CHANEL = 'chanel', 'Chanel'
    DIOR = 'dior', 'Dior'
    GUERLAIN = 'guerlain', 'Guerlain'
    ARMANI = 'armani', 'Armani'
    OTHER = "other", "Р†РЅС€РёР№ Р°Р±Рѕ РЅРµРІС–РґРѕРјРёР№"
