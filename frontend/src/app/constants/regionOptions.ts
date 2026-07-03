// frontend/src/app/constants/regionOptions.ts

export const REGION_OPTIONS = [
  { value: 'kyiv_city', label: 'РљРёС—РІ' },
  { value: 'vinnytsia', label: 'Р’С–РЅРЅРёС†СЊРєР°' },
  { value: 'volyn', label: 'Р’РѕР»РёРЅСЃСЊРєР°' },
  { value: 'dnipropetrovsk', label: 'Р”РЅС–РїСЂРѕРїРµС‚СЂРѕРІСЃСЊРєР°' },
  { value: 'donetsk', label: 'Р”РѕРЅРµС†СЊРєР°' },
  { value: 'zhytomyr', label: 'Р–РёС‚РѕРјРёСЂСЃСЊРєР°' },
  { value: 'zakarpattia', label: 'Р—Р°РєР°СЂРїР°С‚СЃСЊРєР°' },
  { value: 'zaporizhzhia', label: 'Р—Р°РїРѕСЂС–Р·СЊРєР°' },
  { value: 'ivano_frankivsk', label: 'Р†РІР°РЅРѕ-Р¤СЂР°РЅРєС–РІСЃСЊРєР°' },
  { value: 'kyiv_region', label: 'РљРёС—РІСЃСЊРєР°' },
  { value: 'kirovohrad', label: 'РљС–СЂРѕРІРѕРіСЂР°РґСЃСЊРєР°' },
  { value: 'luhansk', label: 'Р›СѓРіР°РЅСЃСЊРєР°' },
  { value: 'lviv', label: 'Р›СЊРІС–РІСЃСЊРєР°' },
  { value: 'mykolaiv', label: 'РњРёРєРѕР»Р°С—РІСЃСЊРєР°' },
  { value: 'odesa', label: 'РћРґРµСЃСЊРєР°' },
  { value: 'poltava', label: 'РџРѕР»С‚Р°РІСЃСЊРєР°' },
  { value: 'rivne', label: 'Р С–РІРЅРµРЅСЃСЊРєР°' },
  { value: 'sumy', label: 'РЎСѓРјСЃСЊРєР°' },
  { value: 'ternopil', label: 'РўРµСЂРЅРѕРїС–Р»СЊСЃСЊРєР°' },
  { value: 'kharkiv', label: 'РҐР°СЂРєС–РІСЃСЊРєР°' },
  { value: 'kherson', label: 'РҐРµСЂСЃРѕРЅСЃСЊРєР°' },
  { value: 'khmelnytskyi', label: 'РҐРјРµР»СЊРЅРёС†СЊРєР°' },
  { value: 'cherkasy', label: 'Р§РµСЂРєР°СЃСЊРєР°' },
  { value: 'chernivtsi', label: 'Р§РµСЂРЅС–РІРµС†СЊРєР°' },
  { value: 'chernihiv', label: 'Р§РµСЂРЅС–РіС–РІСЃСЊРєР°' },
  { value: 'crimea', label: 'РђР  РљСЂРёРј' },
  { value: 'other', label: 'Р†РЅС€Рµ' },
] as const;

export type Region = (typeof REGION_OPTIONS)[number]['value'];

export const DEFAULT_REGION: Region = 'other';

export function isRegion(value: string | null | undefined): value is Region {
  return REGION_OPTIONS.some((region) => region.value === value);
}

export function getRegionLabel(value: string | null | undefined): string | null {
  const region = REGION_OPTIONS.find((item) => item.value === value);

  return region?.label ?? null;
}
