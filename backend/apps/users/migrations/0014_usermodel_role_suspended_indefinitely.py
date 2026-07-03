# Generated manually for safe role/suspension migration

from django.db import migrations, models


def forwards_move_group_roles_to_user_role(apps, schema_editor):
    User = apps.get_model("users", "UserModel")

    admin_ids = list(
        User.objects
        .filter(groups__name="admin", is_superuser=False)
        .values_list("id", flat=True)
    )

    moderator_ids = list(
        User.objects
        .filter(groups__name="moderator", is_superuser=False)
        .exclude(id__in=admin_ids)
        .values_list("id", flat=True)
    )

    if admin_ids:
        User.objects.filter(id__in=admin_ids).update(
            role="admin",
            is_staff=True,
        )

    if moderator_ids:
        User.objects.filter(id__in=moderator_ids).update(
            role="moderator",
            is_staff=True,
        )


def backwards_keep_data(apps, schema_editor):
    # РќРёС‡РµРіРѕ РЅРµ РѕС‚РєР°С‚С‹РІР°РµРј, С‡С‚РѕР±С‹ СЃР»СѓС‡Р°Р№РЅРѕ РЅРµ РёСЃРїРѕСЂС‚РёС‚СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»РµР№.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0013_userstatsmodel_forum_comments_count_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="usermodel",
            name="role",
            field=models.CharField(
                max_length=20,
                choices=[
                    ("superuser", "SUPERUSER"),
                    ("admin", "ADMIN"),
                    ("moderator", "MODERATOR"),
                    ("user", "USER"),
                    ("anonymous", "ANONYMOUS"),
                ],
                default="user",
                db_index=True,
            ),
        ),
        migrations.AddField(
            model_name="usermodel",
            name="suspended_indefinitely",
            field=models.BooleanField(default=False, db_index=True),
        ),
        migrations.RunPython(
            forwards_move_group_roles_to_user_role,
            backwards_keep_data,
        ),
    ]
