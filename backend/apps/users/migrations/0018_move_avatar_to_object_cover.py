from django.db import migrations


def move_profile_avatars(apps, schema_editor):
    Profile = apps.get_model("users", "ProfileModel")
    ObjectCover = apps.get_model("photos", "ObjectCoverModel")
    ContentType = apps.get_model("contenttypes", "ContentType")

    content_type, _ = ContentType.objects.get_or_create(
        app_label="users",
        model="profilemodel",
    )

    for profile in Profile.objects.exclude(avatar="").exclude(avatar__isnull=True).iterator():
        ObjectCover.objects.get_or_create(
            content_type_id=content_type.id,
            object_id=profile.id,
            defaults={"image": profile.avatar.name},
        )


def restore_profile_avatars(apps, schema_editor):
    Profile = apps.get_model("users", "ProfileModel")
    ObjectCover = apps.get_model("photos", "ObjectCoverModel")
    ContentType = apps.get_model("contenttypes", "ContentType")

    content_type, _ = ContentType.objects.get_or_create(
        app_label="users",
        model="profilemodel",
    )

    covers = ObjectCover.objects.filter(content_type_id=content_type.id)

    for cover in covers.iterator():
        Profile.objects.filter(pk=cover.object_id).update(avatar=cover.image.name)


class Migration(migrations.Migration):
    dependencies = [
        ("photos", "0007_alter_perfumephotomodel_type"),
        ("users", "0017_alter_usermodel_account_type"),
    ]

    operations = [
        migrations.RunPython(move_profile_avatars, restore_profile_avatars),
        migrations.RemoveField(
            model_name="profilemodel",
            name="avatar",
        ),
    ]
