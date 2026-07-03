from django.contrib.contenttypes.models import ContentType

from apps.photos.selectors import build_object_photos_map


class ObjectPhotosMapMixin:
    photos_model = None  # РјРѕРґРµР»СЊ РґР»СЏ ContentType
    id_field = "id"      # РїРѕР»Рµ id РІ РѕС‚РІРµС‚Рµ

    def build_photos_map(self, obj_ids):
        ct = ContentType.objects.get_for_model(self.photos_model, for_concrete_model=False)
        return build_object_photos_map(ct_id=ct.id, obj_ids=obj_ids)

    def rerender_paginated_with_photos(self, response, queryset, obj_ids):
        if not obj_ids:
            return response

        photos_map = self.build_photos_map(obj_ids)
        qs = queryset.filter(id__in=obj_ids)
        objs_map = {o.id: o for o in qs}
        objs = [objs_map[i] for i in obj_ids if i in objs_map]

        ser = self.get_serializer(
            objs,
            many=True,
            context={**self.get_serializer_context(), "object_photos_map": photos_map},
        )

        if isinstance(response.data, dict):
            response.data["results"] = ser.data
        else:
            response.data = ser.data
        return response
