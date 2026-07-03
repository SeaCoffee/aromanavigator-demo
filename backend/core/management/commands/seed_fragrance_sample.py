import csv
from collections import defaultdict
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from apps.fragrance.models import (
    BrandModel,
    FragranceFamilyModel,
    FragranceModel,
    FragranceNoteOfficialModel,
    FragrancePerfumerModel,
    NoteModel,
    OlfactoryFamilyModel,
    PerfumerModel,
)


DATA_DIR = Path("/app/fragrance_seed")

BRANDS_FILE = "brands.csv"
NOTES_FILE = "notes.csv"
FAMILIES_FILE = "families.csv"

FRAGRANCES_FILE = "fragrances.csv"
PERFUMERS_FILE = "perfumers.csv"
FRAGRANCE_PERFUMERS_FILE = "fragrance_perfumers.csv"

NOTE_LEVEL_COLUMNS = {
    "top": ("topNotes", "top_notes", "topNoteLabels"),
    "heart": ("heartNotes", "heart_notes", "heartNoteLabels", "middleNotes", "middle_notes"),
    "base": ("baseNotes", "base_notes", "baseNoteLabels"),
}

FAMILY_COLUMNS = ("familyLabels", "families", "familyLabel", "olfactoryFamilies")
PERFUMER_COLUMNS = ("perfumerLabels", "perfumers", "perfumerLabel")


def is_qid(value: str) -> bool:
    value = (value or "").strip()
    return value.startswith("Q") and value[1:].isdigit()


def build_unique_slug(model, base_value: str, slug_field: str = "slug") -> str:
    base_slug = slugify(base_value)[:200] or "item"
    slug = base_slug
    i = 2

    while model.objects.filter(**{slug_field: slug}).exists():
        suffix = f"-{i}"
        slug = f"{base_slug[:200 - len(suffix)]}{suffix}"
        i += 1

    return slug


def clean_csv_value(value: str | None) -> str:
    return (value or "").strip()


def first_value(row: dict, names: tuple[str, ...]) -> str:
    for name in names:
        value = clean_csv_value(row.get(name))
        if value:
            return value

    return ""


def split_labels(value: str) -> list[str]:
    """
    Р”Р»СЏ multi-value РїРѕР»РµР№ РёСЃРїРѕР»СЊР·СѓР№ СЂР°Р·РґРµР»РёС‚РµР»СЊ ; РёР»Рё |.

    РќРµ РґРµР»РёРј РїРѕ Р·Р°РїСЏС‚РѕР№ СЃРїРµС†РёР°Р»СЊРЅРѕ: РІ РґР°РЅРЅС‹С… РјРѕРіСѓС‚ Р±С‹С‚СЊ РЅР°Р·РІР°РЅРёСЏ РІСЂРѕРґРµ
    "Clinique Laboratories, LLC".
    """
    value = clean_csv_value(value)

    if not value:
        return []

    parts = [value]

    for separator in (";", "|", "\n"):
        next_parts: list[str] = []

        for part in parts:
            next_parts.extend(part.split(separator))

        parts = next_parts

    result: list[str] = []
    seen: set[str] = set()

    for part in parts:
        clean = clean_csv_value(part)

        if not clean or is_qid(clean):
            continue

        key = clean.casefold()

        if key in seen:
            continue

        seen.add(key)
        result.append(clean)

    return result


class Command(BaseCommand):
    help = "Import sample fragrance data from CSV files"

    def handle(self, *args, **options):
        brands_csv = DATA_DIR / BRANDS_FILE
        notes_csv = DATA_DIR / NOTES_FILE
        families_csv = DATA_DIR / FAMILIES_FILE

        fragrances_csv = DATA_DIR / FRAGRANCES_FILE
        perfumers_csv = DATA_DIR / PERFUMERS_FILE
        fragrance_perfumers_csv = DATA_DIR / FRAGRANCE_PERFUMERS_FILE

        if not fragrances_csv.exists():
            self.stdout.write(self.style.ERROR(f"File not found: {fragrances_csv}"))
            return

        with transaction.atomic():
            if brands_csv.exists():
                self.import_brands(brands_csv)
            else:
                self.stdout.write(self.style.WARNING(f"File not found: {brands_csv}"))

            if notes_csv.exists():
                self.import_notes(notes_csv)
            else:
                self.stdout.write(self.style.WARNING(f"File not found: {notes_csv}"))

            if families_csv.exists():
                self.import_families(families_csv)
            else:
                self.stdout.write(self.style.WARNING(f"File not found: {families_csv}"))

            self.import_fragrances(fragrances_csv)
            self.import_relations_from_fragrances(fragrances_csv)

            if perfumers_csv.exists():
                self.import_perfumers(perfumers_csv)
            else:
                self.stdout.write(self.style.WARNING(f"File not found: {perfumers_csv}"))

            if fragrance_perfumers_csv.exists():
                self.import_fragrance_perfumers(fragrance_perfumers_csv)
            else:
                self.stdout.write(
                    self.style.WARNING(f"File not found: {fragrance_perfumers_csv}")
                )

        self.stdout.write(self.style.SUCCESS("Import finished"))

    def get_or_create_brand(self, brand_name: str) -> tuple[BrandModel, bool]:
        brand, created = BrandModel.objects.get_or_create(
            name=brand_name,
            defaults={"slug": build_unique_slug(BrandModel, brand_name)},
        )

        if not created and not getattr(brand, "slug", ""):
            brand.slug = build_unique_slug(BrandModel, brand.name)
            brand.save(update_fields=["slug"])

        return brand, created

    def get_or_create_perfumer(self, perfumer_name: str) -> tuple[PerfumerModel, bool]:
        return PerfumerModel.objects.get_or_create(name=perfumer_name)

    def get_or_create_family(self, family_name: str) -> tuple[OlfactoryFamilyModel, bool]:
        family, created = OlfactoryFamilyModel.objects.get_or_create(
            name=family_name,
            defaults={"slug": build_unique_slug(OlfactoryFamilyModel, family_name)},
        )

        if not created and not getattr(family, "slug", ""):
            family.slug = build_unique_slug(OlfactoryFamilyModel, family.name)
            family.save(update_fields=["slug"])

        return family, created

    def get_or_create_note(self, note_name: str) -> tuple[NoteModel, bool]:
        note, created = NoteModel.objects.get_or_create(
            name=note_name,
            defaults={"slug": build_unique_slug(NoteModel, note_name)},
        )

        if not created and not getattr(note, "slug", ""):
            note.slug = build_unique_slug(NoteModel, note.name)
            note.save(update_fields=["slug"])

        return note, created

    def find_fragrance(self, *, brand_name: str = "", perfume_name: str) -> FragranceModel | None:
        perfume_name = clean_csv_value(perfume_name)
        brand_name = clean_csv_value(brand_name)

        if not perfume_name:
            return None

        qs = FragranceModel.objects.select_related("brand").filter(
            name__iexact=perfume_name,
        )

        if brand_name:
            return qs.filter(brand__name__iexact=brand_name).first()

        if qs.count() == 1:
            return qs.first()

        return None

    def import_brands(self, csv_path: Path):
        created_brands = 0
        skipped = 0
        seen: set[str] = set()

        with open(csv_path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)

            for row in reader:
                brand_name = clean_csv_value(row.get("brandLabel"))

                if not brand_name or is_qid(brand_name):
                    skipped += 1
                    continue

                key = brand_name.casefold()

                if key in seen:
                    skipped += 1
                    continue

                seen.add(key)

                _, created = self.get_or_create_brand(brand_name)

                if created:
                    created_brands += 1

        self.stdout.write(
            self.style.WARNING(
                f"Standalone brands import: brands created={created_brands}, "
                f"skipped={skipped}"
            )
        )

    def import_notes(self, csv_path: Path):
        created_notes = 0
        skipped = 0
        seen: set[str] = set()

        with open(csv_path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)

            for row in reader:
                note_name = clean_csv_value(row.get("noteLabel"))

                if not note_name or is_qid(note_name):
                    skipped += 1
                    continue

                key = note_name.casefold()

                if key in seen:
                    skipped += 1
                    continue

                seen.add(key)

                _, created = self.get_or_create_note(note_name)

                if created:
                    created_notes += 1

        self.stdout.write(
            self.style.WARNING(
                f"Standalone notes import: notes created={created_notes}, "
                f"skipped={skipped}"
            )
        )

    def import_families(self, csv_path: Path):
        created_families = 0
        skipped = 0
        seen: set[str] = set()

        with open(csv_path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)

            for row in reader:
                family_name = clean_csv_value(row.get("familyLabel"))

                if not family_name or is_qid(family_name):
                    skipped += 1
                    continue

                key = family_name.casefold()

                if key in seen:
                    skipped += 1
                    continue

                seen.add(key)

                _, created = self.get_or_create_family(family_name)

                if created:
                    created_families += 1

        self.stdout.write(
            self.style.WARNING(
                f"Standalone families import: families created={created_families}, "
                f"skipped={skipped}"
            )
        )

    def import_fragrances(self, csv_path: Path):
        created_brands = 0
        created_fragrances = 0
        updated_fragrance_slugs = 0
        skipped = 0

        seen_pairs: set[tuple[str, str]] = set()

        with open(csv_path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)

            for row in reader:
                perfume_name = clean_csv_value(row.get("perfumeLabel"))
                brand_name = clean_csv_value(row.get("brandLabel"))
                year_raw = clean_csv_value(row.get("year"))

                if not perfume_name or not brand_name:
                    skipped += 1
                    continue

                if is_qid(perfume_name) or is_qid(brand_name):
                    skipped += 1
                    continue

                pair_key = (brand_name.casefold(), perfume_name.casefold())

                if pair_key in seen_pairs:
                    skipped += 1
                    continue

                seen_pairs.add(pair_key)

                brand, brand_created = self.get_or_create_brand(brand_name)

                if brand_created:
                    created_brands += 1

                release_year = None

                if year_raw.isdigit():
                    year_int = int(year_raw)

                    if 1000 <= year_int <= 2100:
                        release_year = year_int

                fragrance, fragrance_created = FragranceModel.objects.get_or_create(
                    brand=brand,
                    name=perfume_name,
                    defaults={
                        "release_year": release_year,
                        "slug": build_unique_slug(
                            FragranceModel,
                            f"{brand.name} {perfume_name}",
                        ),
                    },
                )

                if fragrance_created:
                    created_fragrances += 1
                    continue

                changed = False

                if release_year and not fragrance.release_year:
                    fragrance.release_year = release_year
                    changed = True

                if not getattr(fragrance, "slug", ""):
                    fragrance.slug = build_unique_slug(
                        FragranceModel,
                        f"{brand.name} {fragrance.name}",
                    )
                    changed = True
                    updated_fragrance_slugs += 1

                if changed:
                    fragrance.save()

        self.stdout.write(
            self.style.WARNING(
                f"Fragrances import: brands created={created_brands}, "
                f"fragrances created={created_fragrances}, "
                f"slugs updated={updated_fragrance_slugs}, "
                f"skipped={skipped}"
            )
        )

    def import_relations_from_fragrances(self, csv_path: Path):
        created_perfumers = 0
        created_perfumer_links = 0
        created_families = 0
        created_family_links = 0
        created_notes = 0
        created_note_links = 0
        skipped_rows = 0

        with open(csv_path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)

            for row in reader:
                perfume_name = clean_csv_value(row.get("perfumeLabel"))
                brand_name = clean_csv_value(row.get("brandLabel"))

                fragrance = self.find_fragrance(
                    brand_name=brand_name,
                    perfume_name=perfume_name,
                )

                if not fragrance:
                    skipped_rows += 1
                    continue

                perfumer_labels = split_labels(first_value(row, PERFUMER_COLUMNS))
                for perfumer_name in perfumer_labels:
                    perfumer, perfumer_created = self.get_or_create_perfumer(perfumer_name)

                    if perfumer_created:
                        created_perfumers += 1

                    _, link_created = FragrancePerfumerModel.objects.get_or_create(
                        fragrance=fragrance,
                        perfumer=perfumer,
                    )

                    if link_created:
                        created_perfumer_links += 1

                family_labels = split_labels(first_value(row, FAMILY_COLUMNS))
                for family_name in family_labels:
                    family, family_created = self.get_or_create_family(family_name)

                    if family_created:
                        created_families += 1

                    _, link_created = FragranceFamilyModel.objects.get_or_create(
                        fragrance=fragrance,
                        family=family,
                    )

                    if link_created:
                        created_family_links += 1

                for level, column_names in NOTE_LEVEL_COLUMNS.items():
                    note_labels = split_labels(first_value(row, column_names))

                    for position, note_name in enumerate(note_labels, start=1):
                        note, note_created = self.get_or_create_note(note_name)

                        if note_created:
                            created_notes += 1

                        link, link_created = FragranceNoteOfficialModel.objects.get_or_create(
                            fragrance=fragrance,
                            note=note,
                            level=level,
                            defaults={"position": position},
                        )

                        if link_created:
                            created_note_links += 1
                        elif link.position != position:
                            link.position = position
                            link.save(update_fields=["position", "updated_at"])

        self.stdout.write(
            self.style.WARNING(
                f"Inline relations import: perfumers created={created_perfumers}, "
                f"perfumer links created={created_perfumer_links}, "
                f"families created={created_families}, "
                f"family links created={created_family_links}, "
                f"notes created={created_notes}, "
                f"note links created={created_note_links}, "
                f"skipped rows={skipped_rows}"
            )
        )

    def import_perfumers(self, csv_path: Path):
        created_perfumers = 0
        skipped = 0

        seen: set[str] = set()

        with open(csv_path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)

            for row in reader:
                perfumer_name = clean_csv_value(row.get("perfumerLabel"))

                if not perfumer_name or is_qid(perfumer_name):
                    skipped += 1
                    continue

                key = perfumer_name.casefold()

                if key in seen:
                    skipped += 1
                    continue

                seen.add(key)

                _, created = self.get_or_create_perfumer(perfumer_name)

                if created:
                    created_perfumers += 1

        self.stdout.write(
            self.style.WARNING(
                f"Standalone perfumers import: perfumers created={created_perfumers}, "
                f"skipped={skipped}"
            )
        )

    def build_unique_fragrance_name_map(self):
        by_name: dict[str, list[FragranceModel]] = defaultdict(list)

        fragrances = FragranceModel.objects.select_related("brand").only(
            "id",
            "name",
            "brand__id",
            "brand__name",
        )

        for fragrance in fragrances:
            by_name[fragrance.name.casefold()].append(fragrance)

        result: dict[str, FragranceModel] = {}
        ambiguous: set[str] = set()

        for name_key, items in by_name.items():
            if len(items) == 1:
                result[name_key] = items[0]
            else:
                ambiguous.add(name_key)

        return result, ambiguous

    def import_fragrance_perfumers(self, csv_path: Path):
        created_perfumers = 0
        created_links = 0
        skipped = 0
        skipped_ambiguous_fragrances = 0
        skipped_missing_fragrances = 0

        seen_pairs: set[tuple[str, str, str]] = set()
        fragrance_by_name, ambiguous_fragrance_names = self.build_unique_fragrance_name_map()

        with open(csv_path, newline="", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)

            for row in reader:
                perfume_name = clean_csv_value(row.get("perfumeLabel"))
                brand_name = clean_csv_value(row.get("brandLabel"))
                perfumer_name = clean_csv_value(row.get("perfumerLabel"))

                if not perfume_name or not perfumer_name:
                    skipped += 1
                    continue

                if is_qid(perfume_name) or is_qid(perfumer_name) or is_qid(brand_name):
                    skipped += 1
                    continue

                pair_key = (
                    brand_name.casefold(),
                    perfume_name.casefold(),
                    perfumer_name.casefold(),
                )

                if pair_key in seen_pairs:
                    skipped += 1
                    continue

                seen_pairs.add(pair_key)

                if brand_name:
                    fragrance = self.find_fragrance(
                        brand_name=brand_name,
                        perfume_name=perfume_name,
                    )
                else:
                    fragrance_name_key = perfume_name.casefold()

                    if fragrance_name_key in ambiguous_fragrance_names:
                        skipped_ambiguous_fragrances += 1
                        continue

                    fragrance = fragrance_by_name.get(fragrance_name_key)

                if not fragrance:
                    skipped_missing_fragrances += 1
                    continue

                perfumer, perfumer_created = self.get_or_create_perfumer(perfumer_name)

                if perfumer_created:
                    created_perfumers += 1

                _, link_created = FragrancePerfumerModel.objects.get_or_create(
                    fragrance=fragrance,
                    perfumer=perfumer,
                )

                if link_created:
                    created_links += 1

        self.stdout.write(
            self.style.WARNING(
                f"Fragrance perfumers import: perfumers created={created_perfumers}, "
                f"links created={created_links}, "
                f"skipped={skipped}, "
                f"missing fragrances={skipped_missing_fragrances}, "
                f"ambiguous fragrances={skipped_ambiguous_fragrances}"
            )
        )
