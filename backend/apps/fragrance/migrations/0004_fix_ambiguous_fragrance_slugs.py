from django.db import migrations
from django.db.models import F
from django.utils.text import slugify


def fix_ambiguous_fragrance_slugs(apps, schema_editor):
    Fragrance = apps.get_model("fragrance", "FragranceModel")

    for fragrance in (
        Fragrance.objects
        .select_related("brand")
        .filter(slug=F("brand__slug"))
        .iterator()
    ):
        base = slugify(
            f"{fragrance.brand.name} {fragrance.name}",
            allow_unicode=True,
        )[:240] or f"fragrance-{fragrance.pk}"
        candidate = base
        suffix = 2

        while Fragrance.objects.exclude(pk=fragrance.pk).filter(
            slug=candidate
        ).exists():
            ending = f"-{suffix}"
            candidate = f"{base[:255 - len(ending)]}{ending}"
            suffix += 1

        fragrance.slug = candidate
        fragrance.save(update_fields=["slug"])


class Migration(migrations.Migration):
    dependencies = [
        ("fragrance", "0003_alter_fragrancenoteofficialmodel_level"),
    ]

    operations = [
        migrations.RunPython(
            fix_ambiguous_fragrance_slugs,
            migrations.RunPython.noop,
        ),
    ]
