from django.contrib.auth.models import UserManager as Manager

from core.enums.role_groups_enum import UserRoles


class UserManager(Manager):
    use_in_migrations = True

    def create_user(self, email=None, password=None, **extra_fields):
        if not email:
            raise ValueError("Email must be provided")

        email = self.normalize_email((email or "").strip())

        user = self.model(email=email, **extra_fields)

        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()

        user.save(using=self._db)
        return user

    def create_superuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("email_verified", True)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", UserRoles.SUPERUSER.value)

        if extra_fields["is_active"] is not True:
            raise ValueError("Superuser must be is_active")

        if extra_fields["email_verified"] is not True:
            raise ValueError("Superuser must be email_verified")

        if extra_fields["is_staff"] is not True:
            raise ValueError("Superuser must be is_staff")

        if extra_fields["is_superuser"] is not True:
            raise ValueError("Superuser must be is_superuser")

        if extra_fields["role"] != UserRoles.SUPERUSER.value:
            raise ValueError("Superuser must have superuser role")

        return self.create_user(
            email=email,
            password=password,
            **extra_fields,
        )
