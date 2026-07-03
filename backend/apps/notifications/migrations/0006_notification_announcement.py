# Generated for notification announcements.

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("notifications", "0005_notificationmodel_activity_event_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="NotificationAnnouncementModel",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "kind",
                    models.CharField(
                        choices=[
                            ("rules", "РќРѕРІС– РїСЂР°РІРёР»Р°"),
                            ("maintenance", "РўРµС…РЅС–С‡РЅС– СЂРѕР±РѕС‚Рё"),
                            ("promo", "РђРєС†С–СЏ"),
                            ("site_update", "РћРЅРѕРІР»РµРЅРЅСЏ СЃР°Р№С‚Сѓ"),
                            ("other", "РћРіРѕР»РѕС€РµРЅРЅСЏ"),
                        ],
                        db_index=True,
                        default="other",
                        max_length=32,
                    ),
                ),
                ("title", models.CharField(max_length=180)),
                ("body", models.TextField(max_length=2000)),
                ("is_active", models.BooleanField(db_index=True, default=True)),
                (
                    "starts_at",
                    models.DateTimeField(blank=True, db_index=True, null=True),
                ),
                (
                    "ends_at",
                    models.DateTimeField(blank=True, db_index=True, null=True),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="notification_announcements",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "notification_announcement",
                "ordering": ["-created_at", "-id"],
            },
        ),
        migrations.CreateModel(
            name="NotificationAnnouncementReadModel",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("read_at", models.DateTimeField(default=django.utils.timezone.now)),
                (
                    "announcement",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reads",
                        to="notifications.notificationannouncementmodel",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="read_notification_announcements",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "notification_announcement_read",
                "ordering": ["-read_at", "-id"],
            },
        ),
        migrations.AddIndex(
            model_name="notificationannouncementmodel",
            index=models.Index(
                fields=["is_active", "starts_at", "ends_at"],
                name="idx_notif_ann_active_window",
            ),
        ),
        migrations.AddIndex(
            model_name="notificationannouncementmodel",
            index=models.Index(fields=["kind", "created_at"], name="idx_notif_ann_kind_time"),
        ),
        migrations.AddIndex(
            model_name="notificationannouncementreadmodel",
            index=models.Index(fields=["user", "read_at"], name="idx_notif_ann_read_user"),
        ),
        migrations.AddIndex(
            model_name="notificationannouncementreadmodel",
            index=models.Index(
                fields=["announcement", "user"],
                name="idx_notif_ann_read_pair",
            ),
        ),
        migrations.AddConstraint(
            model_name="notificationannouncementreadmodel",
            constraint=models.UniqueConstraint(
                fields=("announcement", "user"),
                name="uq_notif_ann_read_user_once",
            ),
        ),
    ]
