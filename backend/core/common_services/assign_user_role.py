from django.contrib.auth.models import Group


def assign_user_to_role(user, role: str):
    if role not in ["admin", "moderator"]:
        raise ValueError(f"Unknown role: {role}")

    user.groups.clear()

    group, _ = Group.objects.get_or_create(name=role)
    user.groups.add(group)

    user.is_staff = True
    user.is_active = True
    user.save(update_fields=["is_staff", "is_active"])
