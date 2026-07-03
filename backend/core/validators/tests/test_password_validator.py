from django.core.exceptions import ValidationError
from django.test import SimpleTestCase

from core.validators.password_validator import validate_password


class PasswordValidatorTests(SimpleTestCase):
    def test_accepts_strong_password(self):
        self.assertEqual(validate_password("Aroma2026!"), "Aroma2026!")

    def test_rejects_missing_required_character_classes(self):
        with self.assertRaises(ValidationError):
            validate_password("AromaNavigator!")

        with self.assertRaises(ValidationError):
            validate_password("aroma2026!")

        with self.assertRaises(ValidationError):
            validate_password("AROMA2026!")

        with self.assertRaises(ValidationError):
            validate_password("Aroma2026")

    def test_rejects_spaces(self):
        with self.assertRaises(ValidationError):
            validate_password("Aroma 2026!")

    def test_rejects_too_long_password(self):
        with self.assertRaises(ValidationError):
            validate_password("AromaNavigator2026!")
