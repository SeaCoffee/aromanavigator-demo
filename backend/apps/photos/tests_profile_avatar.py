import io
import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework.test import APITestCase

from apps.photos.models import ObjectCoverModel
from apps.users.models import ProfileModel
from core.validators.photos_validators import MAX_IMAGE_FILE_SIZE


User = get_user_model()


def image_file(name: str = "avatar.png") -> SimpleUploadedFile:
    buffer = io.BytesIO()
    Image.new("RGB", (16, 16), color="white").save(buffer, format="PNG")

    return SimpleUploadedFile(
        name,
        buffer.getvalue(),
        content_type="image/png",
    )


class ProfileAvatarPhotoApiTests(APITestCase):
    def setUp(self):
        self.media_dir = tempfile.TemporaryDirectory()
        self.settings_override = override_settings(MEDIA_ROOT=self.media_dir.name)
        self.settings_override.enable()

        self.user = User.objects.create_user(
            email="avatar-owner@example.com",
            password="Testpass123!",
            is_active=True,
        )
        self.profile = ProfileModel.objects.create(
            user=self.user,
            name="Avatar Owner",
            display_name="AvatarOwner",
        )
        self.client.force_authenticate(self.user)
        self.target = f"users.profilemodel:{self.profile.id}"

    def tearDown(self):
        self.settings_override.disable()
        self.media_dir.cleanup()

    def test_owner_can_add_replace_and_delete_avatar_cover(self):
        create_response = self.client.post(
            "/userApi/photos/object/cover",
            {"target": self.target, "image": image_file()},
            format="multipart",
        )

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(ObjectCoverModel.objects.count(), 1)
        first_cover = ObjectCoverModel.objects.get()
        first_storage = first_cover.image.storage
        first_name = first_cover.image.name
        self.assertTrue(first_storage.exists(first_name))

        with self.captureOnCommitCallbacks(execute=True):
            replace_response = self.client.post(
                "/userApi/photos/object/cover",
                {"target": self.target, "image": image_file("replacement.png")},
                format="multipart",
            )

        self.assertEqual(replace_response.status_code, 201)
        self.assertEqual(ObjectCoverModel.objects.count(), 1)
        self.assertFalse(first_storage.exists(first_name))

        cover_id = replace_response.data["id"]
        replacement = ObjectCoverModel.objects.get(pk=cover_id)
        replacement_storage = replacement.image.storage
        replacement_name = replacement.image.name

        with self.captureOnCommitCallbacks(execute=True):
            delete_response = self.client.delete(
                f"/userApi/photos/object/cover/{cover_id}/delete",
            )

        self.assertEqual(delete_response.status_code, 204)
        self.assertFalse(ObjectCoverModel.objects.exists())
        self.assertFalse(replacement_storage.exists(replacement_name))

    def test_profile_does_not_accept_photo_attachments(self):
        response = self.client.post(
            "/userApi/photos/object/attachments",
            {"target": self.target, "images": [image_file()]},
            format="multipart",
        )

        self.assertEqual(response.status_code, 400)

    def test_avatar_rejects_file_larger_than_eight_megabytes(self):
        oversized = SimpleUploadedFile(
            "oversized.png",
            image_file().read() + b"\0" * MAX_IMAGE_FILE_SIZE,
            content_type="image/png",
        )

        response = self.client.post(
            "/userApi/photos/object/cover",
            {"target": self.target, "image": oversized},
            format="multipart",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(ObjectCoverModel.objects.exists())
