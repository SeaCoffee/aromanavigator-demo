from django.db import migrations
from django.db.models import Count


def recalculate_comment_counters(apps, schema_editor):
    ContentType = apps.get_model("contenttypes", "ContentType")
    Comment = apps.get_model("comments", "CommentModel")
    ForumSection = apps.get_model("forum", "ForumSectionModel")
    ForumTopic = apps.get_model("forum", "ForumTopicModel")

    topic_content_type = ContentType.objects.filter(
        app_label="forum",
        model="forumtopicmodel",
    ).first()
    if topic_content_type is None:
        return

    topic_counts = {
        row["object_id"]: row["total"]
        for row in (
            Comment.objects
            .filter(
                content_type_id=topic_content_type.id,
                is_deleted=False,
            )
            .values("object_id")
            .annotate(total=Count("id"))
        )
    }

    for topic in ForumTopic.objects.only("id", "section_id"):
        ForumTopic.objects.filter(pk=topic.pk).update(
            comments_count=topic_counts.get(topic.pk, 0),
        )

    for section in ForumSection.objects.only("id"):
        total = sum(
            topic_counts.get(topic_id, 0)
            for topic_id in ForumTopic.objects.filter(
                section_id=section.pk
            ).values_list("id", flat=True)
        )
        ForumSection.objects.filter(pk=section.pk).update(comments_count=total)


class Migration(migrations.Migration):
    dependencies = [
        ("comments", "0006_commentmodel_is_official"),
        ("forum", "0002_remove_forumtopicmodel_idx_forum_topic_section_last_and_more"),
    ]

    operations = [
        migrations.RunPython(
            recalculate_comment_counters,
            migrations.RunPython.noop,
        ),
    ]
