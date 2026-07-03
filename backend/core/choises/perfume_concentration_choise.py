from django.db import models

class CONCENTRATION_CHOICES(models.TextChoices):
    PARFUM = 'parfum', 'Parfum / Extrait de Parfum'
    ESPRIT = 'esprit', 'Esprit de Parfum'
    EDP = 'edp', 'Eau de Parfum'
    EDT = 'edt', 'Eau de Toilette'
    EDC = 'edc', 'Eau de Cologne'
    EAU_FRAICHE = 'eau_fraiche', 'Eau Fraiche'
    MIST = 'mist', 'РњС–СЃС‚ РґР»СЏ С‚С–Р»Р°'
    HAIR = 'hair', 'РњС–СЃС‚ РґР»СЏ РІРѕР»РѕСЃСЃСЏ'
    OIL = 'oil', 'РџР°СЂС„СѓРјРѕРІР°РЅР° РѕР»С–СЏ'
    SOLID = 'solid', 'РўРІРµСЂРґС– РїР°СЂС„СѓРјРё'
    AFTERSHAVE = 'aftershave', 'Р—Р°СЃС–Р± РїС–СЃР»СЏ РіРѕР»С–РЅРЅСЏ'
    OTHER = 'other', 'Р†РЅС€Р° Р°Р±Рѕ РЅРµРІС–РґРѕРјР°'
