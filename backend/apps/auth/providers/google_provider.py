from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from django.conf import settings
from apps.auth.exceptions.auth_social_exception import ProviderAuthError, ProviderConfigError
from apps.auth.constants.auth_social_constants import GOOGLE_ISSUERS
from apps.auth.dataclasses.auth_social_dataclasses import SOCIAL_AUTH




def verify_google_id_token(idt: str) -> dict:
    # СЃРѕР±РёСЂР°РµРј СЃРїРёСЃРѕРє РґРѕРїСѓСЃС‚РёРјС‹С… client_id
    allowed_audiences: list[str] = []

    if SOCIAL_AUTH.GOOGLE_CLIENT_ID:
        allowed_audiences.append(str(SOCIAL_AUTH.GOOGLE_CLIENT_ID).strip())

    allowed_audiences.extend([str(x).strip() for x in SOCIAL_AUTH.GOOGLE_CLIENT_IDS])

    # СѓР±РёСЂР°РµРј РїСѓСЃС‚С‹Рµ Рё РґСѓР±Р»РёРєР°С‚С‹
    allowed_audiences = [a for a in {a for a in allowed_audiences} if a]

    if not allowed_audiences:
        raise ProviderConfigError("No GOOGLE_CLIENT_ID(S) configured")

    try:
        # Р±РёР±Р»РёРѕС‚РµРєР° РїСЂРѕРІРµСЂСЏРµС‚ РїРѕРґРїРёСЃСЊ/exp, РЅРѕ aud РјС‹ РїСЂРѕРІРµСЂСЏРµРј СЃР°РјРё
        claims = id_token.verify_oauth2_token(
            idt,
            grequests.Request(),
            audience=None,
        )
    except ValueError as e:
        raise ProviderAuthError(str(e))

    sub = claims.get("sub")
    if not sub:
        raise ProviderAuthError("Token has no subject (sub).")

    iss = claims.get("iss")
    if iss not in GOOGLE_ISSUERS:
        raise ProviderAuthError(f"Invalid token issuer: {iss}")

    aud = claims.get("aud")
    if aud not in allowed_audiences:
        raise ProviderAuthError(f"Invalid token audience: {aud}")

    return {
        "provider_user_id": sub,  # вњ… РёСЃРїРѕР»СЊР·СѓРµРј СѓР¶Рµ РїСЂРѕРІРµСЂРµРЅРЅС‹Р№ sub
        "email": claims.get("email"),
        "email_verified": bool(claims.get("email_verified", False)),
        "name": claims.get("name"),
        "picture": claims.get("picture"),
        "raw": claims,
    }
