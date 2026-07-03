from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

UserModel = get_user_model()

class Command(BaseCommand):
    help = 'Р’РёРґР°Р»РёС‚Рё РєРѕСЂРёСЃС‚СѓРІР°С‡Р° Р·Р° email (СЂР°Р·РѕРј С–Р· РїСЂРѕС„С–Р»РµРј)'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='Email РєРѕСЂРёСЃС‚СѓРІР°С‡Р° РґР»СЏ РІРёРґР°Р»РµРЅРЅСЏ')

    def handle(self, *args, **kwargs):
        email = kwargs['email']
        try:
            user = UserModel.objects.get(email=email)
            user.delete()
            self.stdout.write(self.style.SUCCESS(f"РљРѕСЂРёСЃС‚СѓРІР°С‡Р° С– Р№РѕРіРѕ РїСЂРѕС„С–Р»СЊ Р· email {email} РІРёРґР°Р»РµРЅРѕ."))
        except UserModel.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"РљРѕСЂРёСЃС‚СѓРІР°С‡Р° Р· email {email} РЅРµ Р·РЅР°Р№РґРµРЅРѕ."))
