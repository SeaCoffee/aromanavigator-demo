from __future__ import annotations

from django.contrib.contenttypes.models import ContentType
from django.db import IntegrityError, transaction

from apps.favorites.models import PerfumeFavoriteModel


def get_target_content_type(target) -> ContentType:
    return ContentType.objects.get_for_model(
        type(target),
        for_concrete_model=False,
    )


class FavoriteService:
    @staticmethod
    def add_to_favorites(*, user, target) -> tuple[PerfumeFavoriteModel, bool]:
        ct = get_target_content_type(target)

        try:
            with transaction.atomic():
                favorite = PerfumeFavoriteModel.objects.create(
                    user=user,
                    content_type=ct,
                    object_id=target.pk,
                )

                return favorite, True

        except IntegrityError:
            favorite = PerfumeFavoriteModel.objects.get(
                user=user,
                content_type=ct,
                object_id=target.pk,
            )

            return favorite, False

    @staticmethod
    def remove_favorite(*, favorite: PerfumeFavoriteModel) -> None:
        with transaction.atomic():
            PerfumeFavoriteModel.objects.filter(pk=favorite.pk).delete()

    @staticmethod
    def remove_from_favorites(*, user, target) -> bool:
        ct = get_target_content_type(target)

        with transaction.atomic():
            deleted_count, _ = PerfumeFavoriteModel.objects.filter(
                user=user,
                content_type=ct,
                object_id=target.pk,
            ).delete()

        return deleted_count > 0

    @staticmethod
    def toggle_favorite(*, user, target) -> tuple[bool, PerfumeFavoriteModel | None]:
        ct = get_target_content_type(target)

        favorite = PerfumeFavoriteModel.objects.filter(
            user=user,
            content_type=ct,
            object_id=target.pk,
        ).first()

        if favorite is not None:
            FavoriteService.remove_favorite(favorite=favorite)
            return False, None

        favorite, _created = FavoriteService.add_to_favorites(
            user=user,
            target=target,
        )

        return True, favorite
