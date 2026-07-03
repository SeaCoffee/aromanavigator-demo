from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0006_site_content_and_feedback"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitecontactsettingsmodel",
            name="footer_site_links",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="sitecontactsettingsmodel",
            name="footer_community_links",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="sitecontactsettingsmodel",
            name="footer_market_links",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="sitecontactsettingsmodel",
            name="footer_legal_links",
            field=models.TextField(blank=True),
        ),
    ]
