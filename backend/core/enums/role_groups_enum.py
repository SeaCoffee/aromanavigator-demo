from enum import Enum


class UserRoles(Enum):
    SUPERUSER = "superuser"
    ADMIN = "admin"
    MODERATOR = "moderator"
    USER = "user"
    ANONYMOUS = "anonymous"

    @classmethod
    def choices(cls):
        return [
            (role.value, role.name)
            for role in cls
        ]
