from django.db import models


class ActivityVerb(models.TextChoices):
    USER_FOLLOWED = "user.followed", "User followed"
    WARDROBE_ITEM_ADDED = "wardrobe.item_added", "Wardrobe item added"
    EXCHANGE_CREATED = "exchange.created", "Exchange created"
    EXCHANGE_ACCEPTED = "exchange.accepted", "Exchange accepted"
    EXCHANGE_REJECTED = "exchange.rejected", "Exchange rejected"
    FORUM_TOPIC_CREATED = "forum.topic_created", "Forum topic created"
    FORUM_COMMENT_CREATED = "forum.comment_created", "Forum comment created"
    ARTICLE_CREATED = "article.created", "Article created"
