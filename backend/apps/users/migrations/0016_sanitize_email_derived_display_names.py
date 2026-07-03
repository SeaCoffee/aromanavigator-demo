import re

from django.db import migrations


NON_DISPLAY_CHARS = re.compile(r"[^A-Za-z0-9._-]+")


def email_derived_display_name(email):
    value = (email or "").strip().replace(" ", "")
    value = NON_DISPLAY_CHARS.sub("", value).strip("._-")
    return value[:30].lower()


def sanitize_public_names(apps, schema_editor):
    Profile = apps.get_model("users", "ProfileModel")

    used = {
        value.lower()
        for value in Profile.objects.values_list("display_name_ci", flat=True)
        if value
    }

    for profile in Profile.objects.select_related("user").iterator():
        current = (profile.display_name or "").strip()
        current_ci = current.lower()
        derived = email_derived_display_name(profile.user.email)

        if "@" not in current and (not derived or current_ci != derived):
            continue

        root = f"user{profile.user_id}"
        candidate = root
        suffix = 2

        while candidate.lower() in used and candidate.lower() != current_ci:
            candidate = f"{root}-{suffix}"
            suffix += 1

        used.discard(current_ci)
        used.add(candidate.lower())

        profile.display_name = candidate
        profile.display_name_ci = candidate.lower()
        profile.save(update_fields=["display_name", "display_name_ci", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0015_rename_users_users_target__5c7ff1_idx_idx_susp_target_started_and_more"),
    ]

    operations = [
        migrations.RunPython(sanitize_public_names, migrations.RunPython.noop),
    ]
