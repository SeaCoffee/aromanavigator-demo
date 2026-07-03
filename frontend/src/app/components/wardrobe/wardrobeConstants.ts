import type { WardrobeStatus } from '@/app/types/wardrobeTypes';

export const WARDROBE_DEFAULT_STATUS: WardrobeStatus = 'own';

export const WARDROBE_STATUS_OPTIONS = [
  {
    value: 'own',
    label: 'РњР°СЋ',
  },
  {
    value: 'want',
    label: 'РҐРѕС‡Сѓ',
  },
  {
    value: 'had',
    label: 'Р‘СѓР»Рѕ',
  },
  {
    value: 'sample',
    label: 'РџСЂРѕР±РЅРёРє',
  },
  {
    value: 'favorite',
    label: 'РЈР»СЋР±Р»РµРЅРµ',
  },
] as const satisfies readonly {
  value: WardrobeStatus;
  label: string;
}[];

export const WARDROBE_DEFAULT_ORDERING =
  'fragrance__brand__name,fragrance__name,status';

export const WARDROBE_ORDERING_OPTIONS = [
  {
    value: WARDROBE_DEFAULT_ORDERING,
    label: 'Р—Р° Р±СЂРµРЅРґРѕРј',
  },
  {
    value: '-fragrance__brand__name,-fragrance__name,status',
    label: 'Р—Р° Р±СЂРµРЅРґРѕРј Сѓ Р·РІРѕСЂРѕС‚РЅРѕРјСѓ РїРѕСЂСЏРґРєСѓ',
  },
  {
    value: 'fragrance__name,fragrance__brand__name,status',
    label: 'Р—Р° РЅР°Р·РІРѕСЋ Р°СЂРѕРјР°С‚Сѓ',
  },
  {
    value: '-updated_at',
    label: 'РЎРїРѕС‡Р°С‚РєСѓ РѕРЅРѕРІР»РµРЅС–',
  },
  {
    value: '-created_at',
    label: 'РЎРїРѕС‡Р°С‚РєСѓ РЅРѕРІС–',
  },
  {
    value: 'created_at',
    label: 'РЎРїРѕС‡Р°С‚РєСѓ СЃС‚Р°СЂС–',
  },
  {
    value: '-rating',
    label: 'Р’РёС‰Р° РѕС†С–РЅРєР°',
  },
  {
    value: 'rating',
    label: 'РќРёР¶С‡Р° РѕС†С–РЅРєР°',
  },
] as const;
