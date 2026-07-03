import type {
  TasteAttitude,
  TasteConcentration,
  TasteFragranceMark,
  TastePriority,
  TasteSeason,
} from '@/app/types/tasteProfileTypes';

export const TASTE_ATTITUDE_OPTIONS: Array<{
  value: TasteAttitude;
  label: string;
}> = [
  { value: 'like', label: 'РџРѕРґРѕР±Р°С”С‚СЊСЃСЏ' },
  { value: 'dislike', label: 'РќРµ РїРѕРґРѕР±Р°С”С‚СЊСЃСЏ' },
];

export const TASTE_SEASON_OPTIONS: Array<{
  value: TasteSeason;
  label: string;
}> = [
  { value: 'spring', label: 'Р’РµСЃРЅР°' },
  { value: 'summer', label: 'Р›С–С‚Рѕ' },
  { value: 'autumn', label: 'РћСЃС–РЅСЊ' },
  { value: 'winter', label: 'Р—РёРјР°' },
  { value: 'all_season', label: 'Р‘СѓРґСЊ-СЏРєРёР№ СЃРµР·РѕРЅ' },
];

export const TASTE_CONCENTRATION_OPTIONS: Array<{
  value: TasteConcentration;
  label: string;
}> = [
  { value: 'edc', label: 'Eau de Cologne' },
  { value: 'edt', label: 'Eau de Toilette' },
  { value: 'edp', label: 'Eau de Parfum' },
  { value: 'parfum', label: 'Parfum' },
  { value: 'extrait', label: 'Extrait de Parfum' },
  { value: 'oil', label: 'Perfume Oil' },
  { value: 'mist', label: 'Mist' },
];

export const TASTE_FRAGRANCE_MARK_OPTIONS: Array<{
  value: TasteFragranceMark;
  label: string;
}> = [
  { value: 'looking_for', label: 'РЁСѓРєР°СЋ Р·Р°СЂР°Р·' },
  { value: 'do_not_offer', label: 'РќРµ РїСЂРѕРїРѕРЅСѓРІР°С‚Рё' },
];

export const TASTE_PRIORITY_OPTIONS: Array<{
  value: TastePriority;
  label: string;
}> = [
  { value: 'low', label: 'РќРёР·СЊРєРёР№' },
  { value: 'normal', label: 'Р—РІРёС‡Р°Р№РЅРёР№' },
  { value: 'high', label: 'Р’РёСЃРѕРєРёР№' },
];
