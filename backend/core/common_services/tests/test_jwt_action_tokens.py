from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken

from core.common_services.jwt_service import JWTService, RecoveryToken
from apps.auth.exceptions.jwt_exceptions import JWTBlacklistException, JWTExpiredException

User = get_user_model()


class JWTActionTokenTests(TestCase):
    def test_action_token_consume_blacklists(self):
        user = User.objects.create_user(
            email="u1@example.com",
            password="OldPass123!",
            is_active=True,
        )

        token_str = JWTService.create_action_token(user, RecoveryToken)

        # вњ… JTI РЅР°РґРѕ РІР·СЏС‚СЊ Р”Рћ consume, РёРЅР°С‡Рµ RecoveryToken(token_str) СѓРїР°РґС‘С‚ (РѕРЅ СѓР¶Рµ blacklisted)
        tok_before = RecoveryToken(token_str)
        jti = tok_before.payload.get("jti")
        self.assertIsNotNone(jti)

        # РїРµСЂРІС‹Р№ РІС‹Р·РѕРІ вЂ” consume=True
        returned_user = JWTService.verify_action_token(
            token_str,
            RecoveryToken,
            consume=True,
        )
        self.assertEqual(returned_user.pk, user.pk)

        # С‚РѕРєРµРЅ РґРѕР»Р¶РµРЅ Р±С‹С‚СЊ РІ blacklist
        self.assertTrue(
            BlacklistedToken.objects.filter(token__jti=jti).exists()
        )

        # РїРѕРІС‚РѕСЂРЅР°СЏ РїСЂРѕРІРµСЂРєР° РґРѕР»Р¶РЅР° СѓРїР°СЃС‚СЊ РєР°Рє blacklisted
        with self.assertRaises(JWTBlacklistException):
            JWTService.verify_action_token(
                token_str,
                RecoveryToken,
                consume=False,
            )

    def test_action_token_get_does_not_consume(self):
        user = User.objects.create_user(
            email="u2@example.com",
            password="OldPass123!",
            is_active=True,
        )

        token_str = JWTService.create_action_token(user, RecoveryToken)

        returned_user = JWTService.verify_action_token(
            token_str,
            RecoveryToken,
            consume=False,
        )
        self.assertEqual(returned_user.pk, user.pk)

        tok = RecoveryToken(token_str)
        jti = tok.payload.get("jti")
        self.assertFalse(
            BlacklistedToken.objects.filter(token__jti=jti).exists()
        )

    def test_expired_token_raises(self):
        user = User.objects.create_user(
            email="u3@example.com",
            password="OldPass123!",
            is_active=True,
        )

        tok = RecoveryToken.for_user(user)
        tok.set_exp(lifetime=-tok.lifetime)  # exp РІ РїСЂРѕС€Р»РѕРј
        token_str = str(tok)

        with self.assertRaises(JWTExpiredException):
            JWTService.verify_action_token(
                token_str,
                RecoveryToken,
                consume=False,
            )
