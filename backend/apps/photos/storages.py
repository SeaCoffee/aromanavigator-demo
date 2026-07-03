from django.utils.deconstruct import deconstructible

from core.storage_backends import PrivateMediaStorage


@deconstructible
class PrivatePhotoStorage(PrivateMediaStorage):
    pass

private_photo_storage = PrivatePhotoStorage()
