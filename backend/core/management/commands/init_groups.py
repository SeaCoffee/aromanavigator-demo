from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from core.enums.role_groups_enum import UserRoles


class Command(BaseCommand):
    help = "РЎС‚РІРѕСЂСЋС” СЃС‚Р°РЅРґР°СЂС‚РЅС– РіСЂСѓРїРё РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ"

    def handle(self, *args, **options):
        for role in UserRoles:
            if role == UserRoles.SUPERUSER or role == UserRoles.ANONYMOUS:
                # Р¦С– РґРІР° Р·РЅР°С‡РµРЅРЅСЏ РЅРµ С” РіСЂСѓРїР°РјРё: С†Рµ РїСЂР°РїРѕСЂС†С– Р°Р±Рѕ РѕСЃРѕР±Р»РёРІРёР№ СЃС‚Р°РЅ.
                continue
            group, created = Group.objects.get_or_create(name=role.value)
            if created:
                self.stdout.write(self.style.SUCCESS(f"РЎС‚РІРѕСЂРµРЅРѕ РіСЂСѓРїСѓ: {role.value}"))
            else:
                self.stdout.write(self.style.WARNING(f"Р“СЂСѓРїР° РІР¶Рµ С–СЃРЅСѓС”: {role.value}"))
