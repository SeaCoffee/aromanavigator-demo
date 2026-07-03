from apps.favorites.item_serializers import (
    FavoriteForumTopicItemSerializer,
    FavoriteFragranceItemSerializer,
)
from apps.fragrance.models import FragranceModel

try:
    from apps.forum.models import ForumTopicModel
except ImportError:
    ForumTopicModel = None


SERIALIZER_MAP = {
    FragranceModel: FavoriteFragranceItemSerializer,
}

if ForumTopicModel is not None:
    SERIALIZER_MAP[ForumTopicModel] = FavoriteForumTopicItemSerializer
