from django.db import migrations, models


FOOTER_PAGES = {
    "about": ("РџСЂРѕ СЃР°Р№С‚", ""),
    "fragrance-database": ("РџСЂРѕ Р±Р°Р·Сѓ Р°СЂРѕРјР°С‚С–РІ", ""),
    "cooperation": ("РЎРїС–РІРїСЂР°С†СЏ", ""),
    "forum-rules": ("РџСЂР°РІРёР»Р° С„РѕСЂСѓРјСѓ", ""),
    "authenticity-check": ("РџРµСЂРµРІС–СЂРєР° РѕСЂРёРіС–РЅР°Р»СЊРЅРѕСЃС‚С–", ""),
    "exchange-return": ("РћР±РјС–РЅ С– РїРѕРІРµСЂРЅРµРЅРЅСЏ", ""),
    "terms": ("РџСЂР°РІРёР»Р° РєРѕСЂРёСЃС‚СѓРІР°РЅРЅСЏ", ""),
    "privacy": ("РџРѕР»С–С‚РёРєР° РєРѕРЅС„С–РґРµРЅС†С–Р№РЅРѕСЃС‚С–", ""),
    "contacts": ("РљРѕРЅС‚Р°РєС‚Рё", ""),
}


def create_footer_pages(apps, schema_editor):
    SitePage = apps.get_model("core", "SitePageModel")

    for slug, (title, body) in FOOTER_PAGES.items():
        SitePage.objects.update_or_create(
            slug=slug,
            defaults={
                "title": title,
                "body": body,
                "is_published": True,
            },
        )


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0007_footer_link_columns"),
    ]

    operations = [
        migrations.AlterField(
            model_name="sitepagemodel",
            name="slug",
            field=models.CharField(
                choices=[
                    ("about", "РџСЂРѕ СЃР°Р№С‚"),
                    ("fragrance-database", "РџСЂРѕ Р±Р°Р·Сѓ Р°СЂРѕРјР°С‚С–РІ"),
                    ("cooperation", "РЎРїС–РІРїСЂР°С†СЏ"),
                    ("forum-rules", "РџСЂР°РІРёР»Р° С„РѕСЂСѓРјСѓ"),
                    ("authenticity-check", "РџРµСЂРµРІС–СЂРєР° РѕСЂРёРіС–РЅР°Р»СЊРЅРѕСЃС‚С–"),
                    ("exchange-return", "РћР±РјС–РЅ С– РїРѕРІРµСЂРЅРµРЅРЅСЏ"),
                    ("terms", "РџСЂР°РІРёР»Р° РєРѕСЂРёСЃС‚СѓРІР°РЅРЅСЏ"),
                    ("privacy", "РџРѕР»С–С‚РёРєР° РєРѕРЅС„С–РґРµРЅС†С–Р№РЅРѕСЃС‚С–"),
                    ("contacts", "РљРѕРЅС‚Р°РєС‚Рё"),
                ],
                max_length=32,
                unique=True,
            ),
        ),
        migrations.RunPython(create_footer_pages, migrations.RunPython.noop),
    ]
