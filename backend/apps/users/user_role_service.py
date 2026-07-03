from __future__ import annotations

from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError
from django.db.transaction import atomic

from apps.users.models import UserModel
from core.enums.role_groups_enum import UserRoles


STAFF_ROLES = {
    UserRoles.ADMIN.value,
    UserRoles.MODERATOR.value,
}

PROJECT_ROLES = {
    UserRoles.ADMIN.value,
    UserRoles.MODERATOR.value,
    UserRoles.USER.value,
}

ROLE_RANK = {
    UserRoles.ANONYMOUS.value: 0,
    UserRoles.USER.value: 10,
    UserRoles.MODERATOR.value: 50,
    UserRoles.ADMIN.value: 80,
    UserRoles.SUPERUSER.value: 100,
}


class UserRoleService:
    @staticmethod
    def get_role(user: UserModel) -> str:
        if getattr(user, "is_superuser", False):
            return UserRoles.SUPERUSER.value

        role = getattr(user, "role", UserRoles.USER.value) or UserRoles.USER.value
        if role != UserRoles.USER.value:
            return role

        group_names = set(user.groups.values_list("name", flat=True))
        if UserRoles.ADMIN.value in group_names:
            return UserRoles.ADMIN.value
        if UserRoles.MODERATOR.value in group_names:
            return UserRoles.MODERATOR.value
        if getattr(user, "is_staff", False):
            return UserRoles.ADMIN.value

        return role

    @staticmethod
    def get_role_rank(user: UserModel) -> int:
        return ROLE_RANK.get(
            UserRoleService.get_role(user),
            ROLE_RANK[UserRoles.USER.value],
        )

    @staticmethod
    def is_admin(user: UserModel) -> bool:
        return UserRoleService.get_role(user) in {
            UserRoles.SUPERUSER.value,
            UserRoles.ADMIN.value,
        }

    @staticmethod
    def is_moderator(user: UserModel) -> bool:
        return UserRoleService.get_role(user) in {
            UserRoles.SUPERUSER.value,
            UserRoles.ADMIN.value,
            UserRoles.MODERATOR.value,
        }

    @staticmethod
    def is_staff_role(user: UserModel) -> bool:
        return UserRoleService.is_moderator(user)

    @staticmethod
    def can_manage_user(*, actor: UserModel, target: UserModel) -> bool:
        if not UserRoleService.is_moderator(actor):
            return False

        if actor.id == target.id:
            return False

        if getattr(target, "is_superuser", False):
            return False

        if getattr(actor, "is_superuser", False):
            return True

        return UserRoleService.get_role_rank(actor) > UserRoleService.get_role_rank(target)

    @staticmethod
    def can_assign_role(*, actor: UserModel, target: UserModel, role: str) -> bool:
        if role not in PROJECT_ROLES:
            return False

        if not UserRoleService.is_admin(actor):
            return False

        if target.id == actor.id:
            return False

        if getattr(target, "is_superuser", False):
            return False

        if getattr(actor, "is_superuser", False):
            return True

        actor_rank = UserRoleService.get_role_rank(actor)
        target_rank = UserRoleService.get_role_rank(target)
        new_role_rank = ROLE_RANK.get(role, 0)

        return actor_rank > target_rank and actor_rank > new_role_rank

    @staticmethod
    @atomic
    def set_role(
        user: UserModel,
        role: str,
        *,
        actor: UserModel | None = None,
    ) -> UserModel:
        if role not in PROJECT_ROLES:
            raise ValidationError(f"Unknown role: {role}")

        if user.is_superuser:
            raise ValidationError("Cannot change superuser role.")

        if actor is not None and not UserRoleService.can_assign_role(
            actor=actor,
            target=user,
            role=role,
        ):
            raise ValidationError("Not enough rights to change this user role.")

        user.role = role
        user.is_staff = role in STAFF_ROLES

        user.save(update_fields=["role", "is_staff", "updated_at"])
        user.groups.remove(*user.groups.filter(name__in=PROJECT_ROLES))
        if role in STAFF_ROLES:
            group, _ = Group.objects.get_or_create(name=role)
            user.groups.add(group)

        return user

    @staticmethod
    def make_admin(
        user: UserModel,
        *,
        actor: UserModel | None = None,
    ) -> UserModel:
        return UserRoleService.set_role(
            user,
            UserRoles.ADMIN.value,
            actor=actor,
        )

    @staticmethod
    def make_moderator(
        user: UserModel,
        *,
        actor: UserModel | None = None,
    ) -> UserModel:
        return UserRoleService.set_role(
            user,
            UserRoles.MODERATOR.value,
            actor=actor,
        )

    @staticmethod
    def make_user(
        user: UserModel,
        *,
        actor: UserModel | None = None,
    ) -> UserModel:
        return UserRoleService.set_role(
            user,
            UserRoles.USER.value,
            actor=actor,
        )
