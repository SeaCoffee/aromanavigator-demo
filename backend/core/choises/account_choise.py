from django.db import models

class AccountTypes(models.TextChoices):
    BASIC = "basic", "Р‘Р°Р·РѕРІРёР№"
    PREMIUM = "premium", "РџСЂРµРјС–СѓРј"
