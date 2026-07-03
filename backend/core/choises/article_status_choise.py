from django.db import models


class ArticleStatus(models.TextChoices):
    DRAFT = "draft", "Р§РµСЂРЅРµС‚РєР°"
    PENDING = "pending", "РќР° РјРѕРґРµСЂР°С†С–С—"
    PUBLISHED = "published", "РћРїСѓР±Р»С–РєРѕРІР°РЅРѕ"
    REJECTED = "rejected", "Р’С–РґС…РёР»РµРЅРѕ"
