from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def create_default_pages(apps, schema_editor):
    SiteContactSettings = apps.get_model("core", "SiteContactSettingsModel")
    SitePage = apps.get_model("core", "SitePageModel")

    SiteContactSettings.objects.get_or_create(
        pk=1,
        defaults={
            "footer_text": "Aroma Navigator вЂ” РїСЂРѕСЃС‚С–СЂ РґР»СЏ С‚РёС…, С…С‚Рѕ РґРѕСЃР»С–РґР¶СѓС” Р°СЂРѕРјР°С‚Рё.",
        },
    )

    defaults = {
        "about": (
            "РџСЂРѕ Aroma Navigator",
            "Aroma Navigator РґРѕРїРѕРјР°РіР°С” РґРѕСЃР»С–РґР¶СѓРІР°С‚Рё Р°СЂРѕРјР°С‚Рё, РІРµСЃС‚Рё РїР°СЂС„СѓРјРµСЂРЅРёР№ РіР°СЂРґРµСЂРѕР±, РґС–Р»РёС‚РёСЃСЏ РґРѕСЃРІС–РґРѕРј С– Р·РЅР°С…РѕРґРёС‚Рё РїСЂРѕРїРѕР·РёС†С–С— СЃРїС–Р»СЊРЅРѕС‚Рё.",
        ),
        "contacts": (
            "РљРѕРЅС‚Р°РєС‚Рё",
            "Р—РІвЂ™СЏР¶С–С‚СЊСЃСЏ Р· РЅР°РјРё С‡РµСЂРµР· С„РѕСЂРјСѓ Р·РІРѕСЂРѕС‚РЅРѕРіРѕ Р·РІвЂ™СЏР·РєСѓ. РњРё РІС–РґРїРѕРІС–РјРѕ РЅР° РІРєР°Р·Р°РЅСѓ РµР»РµРєС‚СЂРѕРЅРЅСѓ Р°РґСЂРµСЃСѓ.",
        ),
        "privacy": (
            "РџРѕР»С–С‚РёРєР° РєРѕРЅС„С–РґРµРЅС†С–Р№РЅРѕСЃС‚С–",
            "РўСѓС‚ Р±СѓРґРµ РѕРїСѓР±Р»С–РєРѕРІР°РЅР° Р°РєС‚СѓР°Р»СЊРЅР° С–РЅС„РѕСЂРјР°С†С–СЏ РїСЂРѕ РѕР±СЂРѕР±РєСѓ С‚Р° Р·Р°С…РёСЃС‚ РїРµСЂСЃРѕРЅР°Р»СЊРЅРёС… РґР°РЅРёС….",
        ),
        "terms": (
            "РЈРјРѕРІРё РєРѕСЂРёСЃС‚СѓРІР°РЅРЅСЏ",
            "РўСѓС‚ Р±СѓРґСѓС‚СЊ РѕРїСѓР±Р»С–РєРѕРІР°РЅС– Р°РєС‚СѓР°Р»СЊРЅС– РїСЂР°РІРёР»Р° С‚Р° СѓРјРѕРІРё РєРѕСЂРёСЃС‚СѓРІР°РЅРЅСЏ СЃР°Р№С‚РѕРј.",
        ),
    }
    for slug, (title, body) in defaults.items():
        SitePage.objects.get_or_create(
            slug=slug,
            defaults={"title": title, "body": body, "is_published": True},
        )


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0002_delete_perfumephotomodel"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="SiteContactSettingsModel",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("contact_email", models.EmailField(blank=True, max_length=254)),
                ("contact_phone", models.CharField(blank=True, max_length=64)),
                ("contact_address", models.CharField(blank=True, max_length=255)),
                ("support_hours", models.CharField(blank=True, max_length=255)),
                ("footer_text", models.CharField(blank=True, max_length=500)),
                ("instagram_url", models.URLField(blank=True)),
                ("facebook_url", models.URLField(blank=True)),
                ("telegram_url", models.URLField(blank=True)),
            ],
            options={
                "db_table": "site_contact_settings",
                "verbose_name": "РќР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ РєРѕРЅС‚Р°РєС‚С–РІ СЃР°Р№С‚Сѓ",
                "verbose_name_plural": "РќР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ РєРѕРЅС‚Р°РєС‚С–РІ СЃР°Р№С‚Сѓ",
            },
        ),
        migrations.CreateModel(
            name="SiteFaqModel",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("question", models.CharField(max_length=300)),
                ("answer", models.TextField()),
                ("position", models.PositiveIntegerField(db_index=True, default=0)),
                ("is_active", models.BooleanField(db_index=True, default=True)),
            ],
            options={"db_table": "site_faq", "ordering": ["position", "id"]},
        ),
        migrations.CreateModel(
            name="SitePageModel",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("slug", models.CharField(choices=[("about", "РџСЂРѕ РЅР°СЃ"), ("contacts", "РљРѕРЅС‚Р°РєС‚Рё"), ("privacy", "РџРѕР»С–С‚РёРєР° РєРѕРЅС„С–РґРµРЅС†С–Р№РЅРѕСЃС‚С–"), ("terms", "РЈРјРѕРІРё РєРѕСЂРёСЃС‚СѓРІР°РЅРЅСЏ")], max_length=32, unique=True)),
                ("title", models.CharField(max_length=180)),
                ("body", models.TextField(blank=True)),
                ("is_published", models.BooleanField(db_index=True, default=True)),
            ],
            options={"db_table": "site_page", "ordering": ["slug"]},
        ),
        migrations.CreateModel(
            name="FeedbackMessageModel",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=120)),
                ("email", models.EmailField(max_length=254)),
                ("subject", models.CharField(max_length=180)),
                ("message", models.TextField(max_length=5000)),
                ("status", models.CharField(choices=[("new", "РќРѕРІРµ"), ("in_progress", "Р’ СЂРѕР±РѕС‚С–"), ("resolved", "Р’РёСЂС–С€РµРЅРѕ"), ("spam", "РЎРїР°Рј")], db_index=True, default="new", max_length=24)),
                ("admin_note", models.TextField(blank=True, max_length=3000)),
                ("source_path", models.CharField(blank=True, max_length=500)),
                ("ip_address", models.GenericIPAddressField(blank=True, null=True)),
                ("user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="feedback_messages", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "db_table": "site_feedback_message",
                "ordering": ["-created_at", "-id"],
                "indexes": [
                    models.Index(fields=["status", "created_at"], name="idx_feedback_status_time"),
                    models.Index(fields=["email", "created_at"], name="idx_feedback_email_time"),
                ],
            },
        ),
        migrations.RunPython(create_default_pages, migrations.RunPython.noop),
    ]
