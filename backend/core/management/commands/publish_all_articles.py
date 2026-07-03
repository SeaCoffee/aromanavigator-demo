from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from apps.articles.models import Article
from core.choises.article_status_choise import ArticleStatus


class Command(BaseCommand):
    help = "Publish all articles for development and testing."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show how many articles would be changed without updating them.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        queryset = Article.objects.filter(
            ~Q(status=ArticleStatus.PUBLISHED)
            | Q(moderator_comment__isnull=False)
        )
        count = queryset.count()

        if options["dry_run"]:
            self.stdout.write(
                self.style.WARNING(f"Dry run: {count} articles would be published.")
            )
            return

        if count:
            queryset.update(
                status=ArticleStatus.PUBLISHED,
                moderator_comment=None,
                updated_at=timezone.now(),
            )

        self.stdout.write(self.style.SUCCESS(f"Published {count} articles."))
