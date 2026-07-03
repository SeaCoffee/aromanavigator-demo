from django.contrib.contenttypes.models import ContentType

from apps.photos.selectors import build_object_photos_map

from apps.likes.models import LikeModel
from apps.comments.models import CommentModel
from apps.users.avatar_selectors import profile_avatar_url


class WithObjectPhotosMixin:
    def _inject_photos(self, objs, ct_model):
        ct = ContentType.objects.get_for_model(ct_model, for_concrete_model=False)
        ids = [o.id for o in objs]
        photos_map = build_object_photos_map(ct_id=ct.id, obj_ids=ids)
        return photos_map


class CommentUserFieldsMixin:
    def _comment_user(self, obj):
        return getattr(obj, "user", None)

    def _comment_profile(self, obj):
        user = self._comment_user(obj)
        if not user:
            return None
        return getattr(user, "profile", None)

    def get_user_username(self, obj):
        user = self._comment_user(obj)
        if not user:
            return None
        email = getattr(user, "email", None)
        if email:
            return email
        for attr in ("username", "nickname", "login"):
            val = getattr(user, attr, None)
            if val:
                return val
        return None

    def get_user_display_name(self, obj):
        profile = self._comment_profile(obj)
        if profile:
            display_name = getattr(profile, "display_name", None)
            if display_name:
                return display_name
            profile_name = getattr(profile, "name", None)
            if profile_name:
                return profile_name

        user = self._comment_user(obj)
        if user:
            first_name = getattr(user, "first_name", "") or ""
            last_name = getattr(user, "last_name", "") or ""
            full = f"{first_name} {last_name}".strip()
            if full:
                return full

        return self.get_user_username(obj)

    def get_user_avatar(self, obj):
        return profile_avatar_url(self._comment_profile(obj))


class CommentLikesMixin:
    def _comment_like_ct(self):
        return ContentType.objects.get_for_model(CommentModel, for_concrete_model=False)

    def _request_user(self):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not getattr(user, "is_authenticated", False):
            return None
        return user

    def get_is_liked_by_me(self, obj):
        liked_ids = self.context.get("liked_comment_ids")
        if isinstance(liked_ids, set):
            return obj.id in liked_ids
        if isinstance(liked_ids, (list, tuple)):
            return obj.id in liked_ids

        # РµСЃР»Рё РµСЃС‚СЊ map Р»Р°Р№РєРѕРІ, РјРѕР¶РЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РµРіРѕ Рё РґР»СЏ bool
        likes_map = self.context.get("comment_my_likes_map")
        if isinstance(likes_map, dict):
            return obj.id in likes_map

        user = self._request_user()
        if not user:
            return False

        ct = self._comment_like_ct()
        return LikeModel.objects.filter(user=user, content_type=ct, object_id=obj.id).exists()

    def get_my_like_id(self, obj):
        likes_map = self.context.get("comment_my_likes_map")
        if isinstance(likes_map, dict):
            return likes_map.get(obj.id)

        user = self._request_user()
        if not user:
            return None

        ct = self._comment_like_ct()
        return (
            LikeModel.objects
            .filter(user=user, content_type=ct, object_id=obj.id)
            .values_list("id", flat=True)
            .first()
        )




class CommentOwnershipMixin:
    def get_is_owner(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        return bool(user and getattr(user, "is_authenticated", False) and obj.user_id == user.id)
