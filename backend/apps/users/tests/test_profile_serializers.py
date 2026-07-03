from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.test import TestCase

from apps.photos.models import ObjectCoverModel
from apps.users.models import ProfileModel
from apps.users.serializers import ProfileMeSerializer, ProfileSerializer


User = get_user_model()


class ProfileSerializersTests(TestCase):
    def create_profile(self, *, email: str, display_name: str) -> ProfileModel:
        user = User.objects.create_user(
            email=email,
            password="Testpass123!",
            is_active=True,
        )

        return ProfileModel.objects.create(
            user=user,
            name="Name",
            display_name=display_name,
        )

    def test_profile_serializer_allows_own_display_name(self):
        profile = self.create_profile(
            email="owner@example.com",
            display_name="MyNick",
        )
        serializer = ProfileSerializer(
            instance=profile,
            data={"display_name": "MyNick"},
            partial=True,
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_profile_serializer_rejects_duplicate_display_name(self):
        self.create_profile(
            email="first@example.com",
            display_name="MyNick",
        )
        profile = self.create_profile(
            email="second@example.com",
            display_name="OtherNick",
        )
        serializer = ProfileSerializer(
            instance=profile,
            data={"display_name": "MyNick"},
            partial=True,
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn("display_name", serializer.errors)

    def test_profile_me_serializer_returns_none_without_avatar_cover(self):
        profile = self.create_profile(
            email="without-avatar@example.com",
            display_name="WithoutAvatar",
        )

        self.assertIsNone(ProfileMeSerializer(profile).data["avatar_url"])

    def test_profile_me_serializer_returns_object_cover_url(self):
        profile = self.create_profile(
            email="with-avatar@example.com",
            display_name="WithAvatar",
        )
        content_type = ContentType.objects.get_for_model(ProfileModel)
        image_path = f"photos/covers/users/profilemodel/{profile.id}/test.jpg"
        ObjectCoverModel.objects.create(
            content_type=content_type,
            object_id=profile.id,
            image=image_path,
        )

        avatar_url = ProfileMeSerializer(profile).data["avatar_url"]

        self.assertIn(image_path, avatar_url)
