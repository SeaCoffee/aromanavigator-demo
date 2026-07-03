import re
from enum import Enum



class PhoneRegexEnum(Enum):
    E164     = (r'^\+?[1-9]\d{7,14}$', "Phone must be in international format, 8вЂ“15 digits.")
    UA_LOCAL = (r'^0\d{9}$',           "Phone must be valid Ukrainian format (+380XXXXXXXXX or 0XXXXXXXXX).")
    def __init__(self, pattern: str, msg: str):
        self.pattern = pattern
        self.msg = msg

class EmailRegexEnum(Enum):
    SIMPLE = (r'^[^@\s]+@[^@\s]+\.[a-zA-Z0-9]+$', "Invalid email format.")
    def __init__(self, pattern: str, msg: str):
        self.pattern = pattern
        self.msg = msg


class NameRegexEnum(Enum):
    MIN_LENGTH = (r'^.{2,}$', "Name must be at least 2 characters.")
    ONLY_LETTERS = (r'^[\p{L}\s\-\'`]+$', "Name must contain only letters and spaces.")  # Unicode letters

    def __init__(self, pattern: str, msg: str):
        self.pattern = pattern
        self.msg = msg
