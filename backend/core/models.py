from django.conf import settings
from django.db import models


class BaseModel(models.Model):
    class Meta:
        abstract = True

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class SiteContactSettingsModel(BaseModel):
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=64, blank=True)
    contact_address = models.CharField(max_length=255, blank=True)
    support_hours = models.CharField(max_length=255, blank=True)
    footer_text = models.CharField(max_length=500, blank=True)
    footer_site_links = models.TextField(blank=True)
    footer_community_links = models.TextField(blank=True)
    footer_market_links = models.TextField(blank=True)
    footer_legal_links = models.TextField(blank=True)
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    telegram_url = models.URLField(blank=True)

    class Meta:
        db_table = "site_contact_settings"
        verbose_name = "РќР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ РєРѕРЅС‚Р°РєС‚С–РІ СЃР°Р№С‚Сѓ"
        verbose_name_plural = "РќР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ РєРѕРЅС‚Р°РєС‚С–РІ СЃР°Р№С‚Сѓ"

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


class SitePageModel(BaseModel):
    class Slug(models.TextChoices):
        ABOUT = "about", "РџСЂРѕ СЃР°Р№С‚"
        FRAGRANCE_DATABASE = "fragrance-database", "РџСЂРѕ Р±Р°Р·Сѓ Р°СЂРѕРјР°С‚С–РІ"
        COOPERATION = "cooperation", "РЎРїС–РІРїСЂР°С†СЏ"
        FORUM_RULES = "forum-rules", "РџСЂР°РІРёР»Р° С„РѕСЂСѓРјСѓ"
        AUTHENTICITY_CHECK = "authenticity-check", "РџРµСЂРµРІС–СЂРєР° РѕСЂРёРіС–РЅР°Р»СЊРЅРѕСЃС‚С–"
        EXCHANGE_RETURN = "exchange-return", "РћР±РјС–РЅ С– РїРѕРІРµСЂРЅРµРЅРЅСЏ"
        TERMS = "terms", "РџСЂР°РІРёР»Р° РєРѕСЂРёСЃС‚СѓРІР°РЅРЅСЏ"
        PRIVACY = "privacy", "РџРѕР»С–С‚РёРєР° РєРѕРЅС„С–РґРµРЅС†С–Р№РЅРѕСЃС‚С–"
        CONTACTS = "contacts", "РљРѕРЅС‚Р°РєС‚Рё"

    slug = models.CharField(max_length=32, choices=Slug.choices, unique=True)
    title = models.CharField(max_length=180)
    body = models.TextField(blank=True)
    is_published = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = "site_page"
        ordering = ["slug"]

    def __str__(self):
        return self.title


class SiteFaqModel(BaseModel):
    question = models.CharField(max_length=300)
    answer = models.TextField()
    position = models.PositiveIntegerField(default=0, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = "site_faq"
        ordering = ["position", "id"]

    def __str__(self):
        return self.question


class FeedbackStatus(models.TextChoices):
    NEW = "new", "РќРѕРІРµ"
    IN_PROGRESS = "in_progress", "Р’ СЂРѕР±РѕС‚С–"
    RESOLVED = "resolved", "Р’РёСЂС–С€РµРЅРѕ"
    SPAM = "spam", "РЎРїР°Рј"


class FeedbackMessageModel(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="feedback_messages",
    )
    name = models.CharField(max_length=120)
    email = models.EmailField()
    subject = models.CharField(max_length=180)
    message = models.TextField(max_length=5000)
    status = models.CharField(
        max_length=24,
        choices=FeedbackStatus.choices,
        default=FeedbackStatus.NEW,
        db_index=True,
    )
    admin_note = models.TextField(max_length=3000, blank=True)
    source_path = models.CharField(max_length=500, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        db_table = "site_feedback_message"
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(fields=["status", "created_at"], name="idx_feedback_status_time"),
            models.Index(fields=["email", "created_at"], name="idx_feedback_email_time"),
        ]

    def __str__(self):
        return f"{self.get_status_display()}: {self.subject}"
