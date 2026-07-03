from django.db import models

class PERFUME_NAME_CHOICES(models.TextChoices):
    CHANEL_N5 = 'n5', 'Chanel No. 5'
    CHANEL_COCO = 'coco', 'Coco Mademoiselle'
    DIOR_SAUVAGE = 'sauvage', 'Dior Sauvage'
    DIOR_HOMME = 'dior_homme', 'Dior Homme'
    OTHER = "other", "Р†РЅС€РёР№ Р°Р±Рѕ РЅРµРІС–РґРѕРјРёР№"
