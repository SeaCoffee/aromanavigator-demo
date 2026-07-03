import type { ExchangeItemType, ExchangeStatus } from '@/app/types/exchangeTypes';

export const exchangeItemTypeLabels: Record<ExchangeItemType, string> = {
  wardrobe: 'Р“Р°СЂРґРµСЂРѕР±',
};

export const exchangeStatusLabels: Record<ExchangeStatus, string> = {
  pending: 'РћС‡С–РєСѓС” СЂС–С€РµРЅРЅСЏ',
  accepted: 'РџСЂРёР№РЅСЏС‚Рѕ',
  rejected: 'Р’С–РґС…РёР»РµРЅРѕ',
  canceled: 'РЎРєР°СЃРѕРІР°РЅРѕ',
};
