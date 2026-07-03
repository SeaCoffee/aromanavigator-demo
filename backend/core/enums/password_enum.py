from enum import Enum


class PasswordRegexEnum(Enum):
    # 8..16, no spaces
    LENGTH_NO_SPACE = (
        r"^(?=.{8,16}$)\S+$",
        "Password must be 8-16 characters long and contain no spaces.",
    )
    HAS_LOWER = (
        r".*[a-z].*",
        "Password must contain at least one lowercase letter (a-z).",
    )
    HAS_UPPER = (
        r".*[A-Z].*",
        "Password must contain at least one uppercase letter (A-Z).",
    )
    HAS_DIGIT = (
        r".*\d.*",
        "Password must contain at least one digit (0-9).",
    )
    HAS_SPECIAL = (
        r".*[^A-Za-z0-9].*",
        "Password must contain at least one special character (for example !@#$%).",
    )

    def __init__(self, pattern: str, msg: str):
        self.pattern = pattern
        self.msg = msg
