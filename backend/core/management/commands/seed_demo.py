from __future__ import annotations

from dataclasses import dataclass

from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from apps.activity.activity_service import ActivityService
from apps.activity.models import ActivityEventModel
from apps.articles.models import Article, Tag
from apps.comments.models import CommentModel
from apps.exchange.exchange_service import ExchangeService
from apps.exchange.models import ExchangeProposalModel
from apps.forum.models import ForumSectionModel, ForumTopicModel
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
from apps.notifications.models import NotificationModel
from apps.social.models import FollowModel
from apps.users.models import ProfileModel, UserStatsModel
from apps.wardrobe.models import WardrobeItemModel
from core.choises.activity_choises import ActivityVerb
from core.choises.article_status_choise import ArticleStatus
from core.choises.exchange_status import ExchangeStatus
from core.choises.wardrobe_status_choise import WardrobeStatus


DEMO_PASSWORD = "DemoPass1!"
DEMO_EMAILS = [
    "lesia.demo@example.com",
    "marta.demo@example.com",
    "olena.demo@example.com",
    "taras.demo@example.com",
]


@dataclass(frozen=True)
class DemoUser:
    email: str
    name: str
    display_name: str
    region: str
    about: str


DEMO_USERS = [
    DemoUser(
        email="lesia.demo@example.com",
        name="Lesia",
        display_name="Lesia",
        region="kyiv_city",
        about="Collects quiet musks, tea notes and elegant daily scents.",
    ),
    DemoUser(
        email="marta.demo@example.com",
        name="Marta",
        display_name="Marta",
        region="lviv",
        about="Likes amber, incense and dramatic evening perfumes.",
    ),
    DemoUser(
        email="olena.demo@example.com",
        name="Olena",
        display_name="Olena",
        region="odesa",
        about="Loves citrus, neroli and salty summer compositions.",
    ),
    DemoUser(
        email="taras.demo@example.com",
        name="Taras",
        display_name="Taras",
        region="other",
        about="Writes short notes about classics and modern niche releases.",
    ),
]


BRANDS = [
    ("Maison Demo", "France"),
    ("Kyiv Atelier", "Ukraine"),
    ("Amber Archive", "United Kingdom"),
    ("Nord Garden", "Sweden"),
    ("Velvet Lab", "Italy"),
    ("Cedar & Salt", "Spain"),
    ("Nocturne House", "France"),
    ("Solaris Scents", "Portugal"),
]

PERFUMERS = ["Iryna Melnyk", "Marc Bellamy", "Sofia Laurent"]

NOTES = [
    "Bergamot",
    "Neroli",
    "Mandarin",
    "Black Tea",
    "Green Tea",
    "Iris",
    "Violet",
    "Rose",
    "Jasmine",
    "Orange Blossom",
    "Fig Leaf",
    "Cedar",
    "Sandalwood",
    "Vetiver",
    "Patchouli",
    "Amber",
    "Vanilla",
    "Tonka Bean",
    "White Musk",
    "Incense",
    "Sea Salt",
    "Cardamom",
    "Pink Pepper",
    "Oakmoss",
    "Labdanum",
    "Pear",
    "Coffee",
    "Suede",
]

FAMILIES = ["Citrus", "Floral", "Woody", "Amber", "Aquatic", "Green"]

FRAGRANCE_NAMES = [
    "Morning Archive",
    "Tea on Podil",
    "Amber Window",
    "Salted Neroli",
    "Velvet Iris",
    "Cedar Notebook",
    "Fig Garden",
    "Quiet Suede",
    "Solar Mandarin",
    "Rain on Stone",
    "Rose Voltage",
    "Green Library",
    "Nocturne Vanilla",
    "Musk Letter",
    "Orange Blossom Map",
    "Coffee Smoke",
    "Violet Transit",
    "Sandalwood Radio",
    "Pearl Vetiver",
    "Cardamom Light",
    "Sea Glass",
    "Patchouli Index",
    "Jasmine Signal",
    "Tonka Hour",
    "Oakmoss Sketch",
    "Labdanum Noon",
    "Bergamot Static",
    "Incense Terrace",
    "White Musk Room",
    "Black Tea Orbit",
]


class Command(BaseCommand):
    help = "Seed a repeatable portfolio demo dataset."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete previously generated demo data before seeding.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["reset"]:
            self._reset_demo()

        users = self._seed_users()
        brands = self._seed_brands()
        perfumers = self._seed_perfumers()
        notes = self._seed_notes()
        families = self._seed_families()
        fragrances = self._seed_fragrances(brands, perfumers, notes, families)
        wardrobe = self._seed_wardrobes(users, fragrances)
        sections, topics = self._seed_forum(users)
        comments = self._seed_comments(users, topics, fragrances)
        articles = self._seed_articles(users)
        self._seed_social_and_activity(users, wardrobe, topics, comments, articles)
        exchanges = self._seed_exchanges(users, wardrobe)
        self._sync_counts(users, sections, topics)

        self.stdout.write(
            self.style.SUCCESS(
                "Demo seed ready: "
                f"{len(users)} users, {len(fragrances)} fragrances, "
                f"{sum(len(items) for items in wardrobe.values())} wardrobe items, "
                f"{len(exchanges)} exchanges, {len(topics)} topics."
            )
        )
        self.stdout.write("Demo password for all users: DemoPass1!")

    def _reset_demo(self):
        User = get_user_model()
        User.objects.filter(email__in=DEMO_EMAILS).delete()
        ForumSectionModel.objects.filter(slug__startswith="demo-").delete()
        Article.objects.filter(title__startswith="[Demo]").delete()
        Tag.objects.filter(name__startswith="demo-").delete()
        FragranceModel.objects.filter(slug__startswith="demo-").delete()
        BrandModel.objects.filter(slug__startswith="demo-").delete()
        NoteModel.objects.filter(slug__startswith="demo-").delete()
        OlfactoryFamilyModel.objects.filter(slug__startswith="demo-").delete()
        PerfumerModel.objects.filter(name__in=PERFUMERS).delete()

    def _seed_users(self) -> dict[str, object]:
        User = get_user_model()
        result = {}
        now = timezone.now()

        for item in DEMO_USERS:
            user, _ = User.objects.get_or_create(
                email=item.email,
                defaults={
                    "is_active": True,
                    "email_verified": True,
                    "terms_accepted_at": now,
                    "terms_version": "demo",
                    "privacy_version": "demo",
                },
            )
            user.set_password(DEMO_PASSWORD)
            user.is_active = True
            user.email_verified = True
            user.terms_accepted_at = user.terms_accepted_at or now
            user.terms_version = user.terms_version or "demo"
            user.privacy_version = user.privacy_version or "demo"
            user.save()

            ProfileModel.objects.update_or_create(
                user=user,
                defaults={
                    "name": item.name,
                    "display_name": item.display_name,
                    "region": item.region,
                    "about_me": item.about,
                },
            )
            UserStatsModel.objects.get_or_create(user=user)
            result[item.name] = user

        return result

    def _seed_brands(self) -> list[BrandModel]:
        brands = []
        for name, country in BRANDS:
            brand, _ = BrandModel.objects.update_or_create(
                slug=self._slug(name),
                defaults={"name": name, "country": country},
            )
            brands.append(brand)
        return brands

    def _seed_perfumers(self) -> list[PerfumerModel]:
        perfumers = []
        for name in PERFUMERS:
            perfumer, _ = PerfumerModel.objects.get_or_create(name=name)
            perfumers.append(perfumer)
        return perfumers

    def _seed_notes(self) -> list[NoteModel]:
        notes = []
        for name in NOTES:
            note, _ = NoteModel.objects.update_or_create(
                slug=self._slug(name),
                defaults={"name": name},
            )
            notes.append(note)
        return notes

    def _seed_families(self) -> list[OlfactoryFamilyModel]:
        families = []
        for name in FAMILIES:
            family, _ = OlfactoryFamilyModel.objects.update_or_create(
                slug=self._slug(name),
                defaults={"name": name},
            )
            families.append(family)
        return families

    def _seed_fragrances(
        self,
        brands: list[BrandModel],
        perfumers: list[PerfumerModel],
        notes: list[NoteModel],
        families: list[OlfactoryFamilyModel],
    ) -> list[FragranceModel]:
        fragrances = []
        levels = ["top", "middle", "base"]

        for index, name in enumerate(FRAGRANCE_NAMES):
            brand = brands[index % len(brands)]
            fragrance, _ = FragranceModel.objects.update_or_create(
                slug=self._slug(f"{brand.name}-{name}"),
                defaults={
                    "brand": brand,
                    "name": name,
                    "release_year": 2001 + index,
                    "likes_count": (index * 3) % 37,
                },
            )
            fragrances.append(fragrance)

            FragrancePerfumerModel.objects.get_or_create(
                fragrance=fragrance,
                perfumer=perfumers[index % len(perfumers)],
            )
            FragranceFamilyModel.objects.get_or_create(
                fragrance=fragrance,
                family=families[index % len(families)],
            )

            for offset, level in enumerate(levels):
                note = notes[(index * 2 + offset) % len(notes)]
                FragranceNoteOfficialModel.objects.get_or_create(
                    fragrance=fragrance,
                    note=note,
                    level=level,
                    defaults={"position": offset},
                )

        return fragrances

    def _seed_wardrobes(
        self,
        users: dict[str, object],
        fragrances: list[FragranceModel],
    ) -> dict[str, list[WardrobeItemModel]]:
        statuses = [
            WardrobeStatus.OWN,
            WardrobeStatus.SAMPLE,
            WardrobeStatus.WANT,
            WardrobeStatus.FAVORITE,
            WardrobeStatus.HAD,
        ]
        wardrobe = {}

        for user_index, name in enumerate(["Lesia", "Marta", "Olena"]):
            user = users[name]
            items = []
            start = user_index * 5

            for offset in range(5):
                fragrance = fragrances[start + offset]
                item, _ = WardrobeItemModel.objects.update_or_create(
                    user=user,
                    fragrance=fragrance,
                    status=statuses[offset],
                    defaults={
                        "rating": 7 + ((user_index + offset) % 4),
                        "notes": f"Demo note for {fragrance.brand.name} {fragrance.name}.",
                        "is_private": False,
                    },
                )
                items.append(item)

            wardrobe[name] = items

        return wardrobe

    def _seed_forum(self, users: dict[str, object]):
        section_specs = [
            ("Demo General", "demo-general", "Introductions, daily picks and small questions.", 1),
            ("Demo Wardrobes", "demo-wardrobes", "How people organize samples, bottles and wishlists.", 2),
            ("Demo Exchanges", "demo-exchanges", "Exchange etiquette and successful swaps.", 3),
            ("Demo Notes", "demo-notes", "Note-focused discussions and comparisons.", 4),
        ]
        sections = []
        for title, slug, description, order in section_specs:
            section, _ = ForumSectionModel.objects.update_or_create(
                slug=slug,
                defaults={
                    "title": title,
                    "description": description,
                    "order": order,
                    "is_active": True,
                },
            )
            sections.append(section)

        topic_specs = [
            ("What makes a good tea fragrance?", "Lesia", 0),
            ("How do you decide what can be exchanged?", "Marta", 2),
            ("Summer citrus that does not vanish", "Olena", 3),
            ("Organizing samples without chaos", "Lesia", 1),
            ("Amber fragrances for rainy evenings", "Marta", 3),
            ("Your current office-safe perfume", "Taras", 0),
            ("Blind testing notes with friends", "Olena", 3),
            ("Wishlist vs wardrobe: where is the line?", "Taras", 1),
        ]
        topics = []
        for index, (title, author_name, section_index) in enumerate(topic_specs):
            topic, _ = ForumTopicModel.objects.update_or_create(
                section=sections[section_index],
                slug=f"demo-topic-{index + 1}",
                defaults={
                    "author": users[author_name],
                    "title": title,
                    "content": (
                        f"[Demo] {title}. Share a quick take, a favorite example "
                        "or a practical tip from your wardrobe."
                    ),
                    "is_pinned": index == 0,
                    "is_locked": False,
                    "is_hidden": False,
                    "views_count": 12 + index * 5,
                },
            )
            topics.append(topic)

        return sections, topics

    def _seed_comments(
        self,
        users: dict[str, object],
        topics: list[ForumTopicModel],
        fragrances: list[FragranceModel],
    ) -> list[CommentModel]:
        comments = []
        topic_ct = ContentType.objects.get_for_model(ForumTopicModel, for_concrete_model=False)
        fragrance_ct = ContentType.objects.get_for_model(FragranceModel, for_concrete_model=False)
        names = ["Lesia", "Marta", "Olena", "Taras"]

        for index in range(24):
            topic = topics[index % len(topics)]
            user = users[names[index % len(names)]]
            comment, _ = CommentModel.objects.update_or_create(
                content_type=topic_ct,
                object_id=topic.id,
                user=user,
                body=f"Demo forum comment #{index + 1}: I would compare this with something from my wardrobe.",
                defaults={"is_official": False, "is_deleted": False},
            )
            comments.append(comment)

        for index, fragrance in enumerate(fragrances[:6]):
            user = users[names[(index + 1) % len(names)]]
            comment, _ = CommentModel.objects.update_or_create(
                content_type=fragrance_ct,
                object_id=fragrance.id,
                user=user,
                body=f"Demo fragrance impression: {fragrance.name} has a clear, readable structure.",
                defaults={"is_official": False, "is_deleted": False},
            )
            comments.append(comment)

        return comments

    def _seed_articles(self, users: dict[str, object]) -> list[Article]:
        tag, _ = Tag.objects.get_or_create(name="demo-guide")
        articles = []
        specs = [
            ("[Demo] How to start a small fragrance wardrobe", "Lesia"),
            ("[Demo] Reading notes without overthinking", "Taras"),
        ]

        for title, author_name in specs:
            article, _ = Article.objects.update_or_create(
                title=title,
                defaults={
                    "author": users[author_name],
                    "content": (
                        "This demo article gives the portfolio dataset a realistic "
                        "editorial surface with tags, comments and activity."
                    ),
                    "status": ArticleStatus.PUBLISHED,
                },
            )
            article.tags.add(tag)
            articles.append(article)

        return articles

    def _seed_social_and_activity(
        self,
        users: dict[str, object],
        wardrobe: dict[str, list[WardrobeItemModel]],
        topics: list[ForumTopicModel],
        comments: list[CommentModel],
        articles: list[Article],
    ) -> None:
        service = ActivityService()
        follow_pairs = [
            ("Lesia", "Marta"),
            ("Marta", "Lesia"),
            ("Olena", "Lesia"),
        ]

        for follower_name, followee_name in follow_pairs:
            follow, created = FollowModel.objects.get_or_create(
                follower=users[follower_name],
                followee=users[followee_name],
            )
            if created:
                service.publish(
                    actor=follow.follower,
                    verb=ActivityVerb.USER_FOLLOWED.value,
                    target_obj=follow.followee,
                    payload={"activity_kind": "user_followed"},
                    is_private=False,
                )

        wardrobe_activity_items = [
            wardrobe["Lesia"][0],
            wardrobe["Lesia"][1],
            wardrobe["Marta"][0],
            wardrobe["Marta"][1],
            wardrobe["Olena"][0],
        ]

        for item in wardrobe_activity_items:
            self._publish_once(
                service,
                actor=item.user,
                verb=ActivityVerb.WARDROBE_ITEM_ADDED.value,
                target_obj=item,
                payload={
                    "activity_kind": "wardrobe_item_created",
                    "item": {
                        "id": item.id,
                        "status": item.status,
                        "fragrance": {
                            "id": item.fragrance_id,
                            "name": item.fragrance.name,
                            "slug": item.fragrance.slug,
                            "brand": {"name": item.fragrance.brand.name},
                        },
                    },
                },
            )

        for topic in topics[:3]:
            self._publish_once(
                service,
                actor=topic.author,
                verb=ActivityVerb.FORUM_TOPIC_CREATED.value,
                target_obj=topic,
                payload={"activity_kind": "forum_topic_created", "topic": {"id": topic.id, "title": topic.title}},
            )

        for comment in comments[:3]:
            self._publish_once(
                service,
                actor=comment.user,
                verb=ActivityVerb.FORUM_COMMENT_CREATED.value,
                target_obj=comment,
                payload={"activity_kind": "forum_comment_created", "comment_id": comment.id},
            )

        for article in articles[:1]:
            self._publish_once(
                service,
                actor=article.author,
                verb=ActivityVerb.ARTICLE_CREATED.value,
                target_obj=article,
                payload={"activity_kind": "article_created", "article": {"id": article.id, "title": article.title}},
            )

    def _seed_exchanges(
        self,
        users: dict[str, object],
        wardrobe: dict[str, list[WardrobeItemModel]],
    ) -> list[ExchangeProposalModel]:
        exchange_verbs = [
            ActivityVerb.EXCHANGE_CREATED.value,
            ActivityVerb.EXCHANGE_ACCEPTED.value,
            ActivityVerb.EXCHANGE_REJECTED.value,
        ]
        notification_verbs = [
            "exchange_created",
            "exchange_accepted",
            "exchange_rejected",
            ActivityVerb.EXCHANGE_CREATED.value,
            ActivityVerb.EXCHANGE_ACCEPTED.value,
            ActivityVerb.EXCHANGE_REJECTED.value,
        ]
        ActivityEventModel.objects.filter(
            actor__email__in=DEMO_EMAILS,
            verb__in=exchange_verbs,
        ).delete()
        NotificationModel.objects.filter(
            user__email__in=DEMO_EMAILS,
            verb__in=notification_verbs,
        ).delete()
        ExchangeProposalModel.objects.filter(
            proposer__email__in=DEMO_EMAILS,
            owner__email__in=DEMO_EMAILS,
        ).delete()

        pending = ExchangeService.create(
            proposer=users["Marta"],
            requested_type="wardrobe",
            requested_id=wardrobe["Lesia"][0].id,
            owner_id=users["Lesia"].id,
            offer_all=False,
            offered_items=[
                {"type": "wardrobe", "id": wardrobe["Marta"][0].id, "note": "Would swap for a tea scent."},
            ],
            message="Would you consider this for a weekend swap?",
        )

        accepted = ExchangeService.create(
            proposer=users["Lesia"],
            requested_type="wardrobe",
            requested_id=wardrobe["Olena"][0].id,
            owner_id=users["Olena"].id,
            offer_all=False,
            offered_items=[
                {"type": "wardrobe", "id": wardrobe["Lesia"][1].id, "note": "Fresh sample in good condition."},
            ],
            message="I think this matches your citrus wishlist.",
        )
        ExchangeService.accept(
            owner=users["Olena"],
            proposal=accepted,
            accepted_items=[{"type": "wardrobe", "id": wardrobe["Lesia"][1].id}],
            decision_note="Accepted for the demo scenario.",
        )

        rejected = ExchangeService.create(
            proposer=users["Olena"],
            requested_type="wardrobe",
            requested_id=wardrobe["Marta"][0].id,
            owner_id=users["Marta"].id,
            offer_all=False,
            offered_items=[
                {"type": "wardrobe", "id": wardrobe["Olena"][1].id, "note": "Light summer profile."},
            ],
            message="Maybe this would be a fair exchange?",
        )
        ExchangeService.reject(
            owner=users["Marta"],
            proposal=rejected,
            decision_note="Rejected in demo to show completed flow.",
        )

        return [pending, accepted, rejected]

    def _sync_counts(
        self,
        users: dict[str, object],
        sections: list[ForumSectionModel],
        topics: list[ForumTopicModel],
    ) -> None:
        topic_ct = ContentType.objects.get_for_model(ForumTopicModel, for_concrete_model=False)

        for topic in topics:
            comment_count = CommentModel.objects.filter(
                content_type=topic_ct,
                object_id=topic.id,
                is_deleted=False,
            ).count()
            topic.comments_count = comment_count
            topic.save(update_fields=["comments_count", "updated_at"])

        for section in sections:
            section.topics_count = ForumTopicModel.objects.filter(section=section, is_hidden=False).count()
            section.comments_count = sum(topic.comments_count for topic in ForumTopicModel.objects.filter(section=section))
            section.save(update_fields=["topics_count", "comments_count", "updated_at"])

        for user in users.values():
            stats, _ = UserStatsModel.objects.get_or_create(user=user)
            stats.following_count = FollowModel.objects.filter(follower=user).count()
            stats.followers_count = FollowModel.objects.filter(followee=user).count()
            stats.notifications_unread_count = NotificationModel.objects.filter(user=user, is_read=False).count()
            stats.forum_topics_count = ForumTopicModel.objects.filter(author=user).count()
            stats.forum_comments_count = CommentModel.objects.filter(user=user, is_deleted=False).count()
            stats.save()

    def _publish_once(self, service, *, actor, verb, target_obj, payload):
        meta = target_obj._meta
        exists = ActivityEventModel.objects.filter(
            actor=actor,
            verb=verb,
            target_app=meta.app_label,
            target_model=meta.model_name,
            target_id=target_obj.pk,
        ).exists()
        if exists:
            return

        service.publish(
            actor=actor,
            verb=verb,
            target_obj=target_obj,
            payload=payload,
            is_private=False,
        )

    def _slug(self, value: str) -> str:
        return f"demo-{slugify(value)}"
