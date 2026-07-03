from django.core.management.base import BaseCommand

from apps.photos.storage_service import PhotoStorageService


class Command(BaseCommand):
    help = "Move existing photo files into the centralized photos/ directory."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        result = PhotoStorageService.normalize_paths(dry_run=options["dry_run"])
        self.stdout.write(
            self.style.SUCCESS(
                "scanned={scanned} moved={moved} missing={missing} skipped={skipped}".format(
                    scanned=result.scanned,
                    moved=result.moved,
                    missing=result.missing,
                    skipped=result.skipped,
                )
            )
        )
