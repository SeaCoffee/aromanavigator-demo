from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0019_usermodel_deleted_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="usermodel",
            name="terms_accepted_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="usermodel",
            name="terms_version",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="usermodel",
            name="privacy_version",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="usermodel",
            name="terms_acceptance_ip",
            field=models.GenericIPAddressField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="usermodel",
            name="terms_acceptance_user_agent",
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
