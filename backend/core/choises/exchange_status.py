from django.db import models


class ExchangeStatus(models.TextChoices):
    PENDING = "pending", "РћС‡С–РєСѓС” РІС–РґРїРѕРІС–РґС–"
    ACCEPTED = "accepted", "РџСЂРёР№РЅСЏС‚Рѕ"
    REJECTED = "rejected", "Р’С–РґС…РёР»РµРЅРѕ"
    CANCELED = "canceled", "РЎРєР°СЃРѕРІР°РЅРѕ"
