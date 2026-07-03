import time

from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.social.selectors import exclude_blocked_for_viewer
from apps.users.models import UserModel

from .redis_client import r, RedisConnectionError


PRESENCE_ONLINE_TTL_SECONDS = getattr(
    settings,
    "PRESENCE_ONLINE_TTL_SECONDS",
    600,
)
PRESENCE_BULK_MAX_IDS = 100


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def presence_heartbeat(request):
    uid = request.user.id

    if uid:
        try:
            r.setex(f"presence:{uid}", PRESENCE_ONLINE_TTL_SECONDS, int(time.time()))
        except RedisConnectionError:
            pass

    return Response(status=204)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def presence_bulk(request):
    ids_raw = request.query_params.getlist("ids")
    ids = list(dict.fromkeys(
        str(i) for i in ids_raw if str(i).isdigit()
    ))[:PRESENCE_BULK_MAX_IDS]

    if not ids:
        return Response({})

    visible_ids = set(
        exclude_blocked_for_viewer(
            UserModel.objects.filter(id__in=ids, is_active=True),
            request.user,
        ).values_list("id", flat=True)
    )
    readable_ids = [uid for uid in ids if int(uid) in visible_ids]
    result = {
        uid: {"is_online": False}
        for uid in ids
    }

    try:
        pipe = r.pipeline()

        for uid in readable_ids:
            pipe.exists(f"presence:{uid}")

        flags = pipe.execute()

        for uid, flag in zip(readable_ids, flags):
            result[uid] = {"is_online": bool(flag)}

        return Response(result)

    except RedisConnectionError:
        return Response(result)
