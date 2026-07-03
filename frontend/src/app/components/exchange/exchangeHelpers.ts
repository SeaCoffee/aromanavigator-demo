import type {
  ExchangeItemPayload,
  ExchangeItemType,
  ExchangeListResponse,
  ExchangeProposal,
  ExchangeRequestedShort,
  ExchangeStatus,
} from '@/app/types/exchangeTypes';
import { paginatedResults } from '@/app/utils/valueUtils';

export function getExchangeResults(data: ExchangeListResponse): ExchangeProposal[] {
  return paginatedResults(data);
}

export function getExchangeTotal(data: ExchangeListResponse): number {
  if (Array.isArray(data)) return data.length;
  if ('total_items' in data) return data.total_items;
  return data.count;
}

export function getExchangeStatusLabel(status: ExchangeStatus): string {
  const labels: Record<ExchangeStatus, string> = {
    pending: 'РћС‡С–РєСѓС”',
    accepted: 'РџСЂРёР№РЅСЏС‚Рѕ',
    rejected: 'Р’С–РґС…РёР»РµРЅРѕ',
    canceled: 'РЎРєР°СЃРѕРІР°РЅРѕ',
  };

  return labels[status];
}

export function getExchangeItemTypeLabel(type: ExchangeItemType): string {
  const labels: Record<ExchangeItemType, string> = {
    wardrobe: 'Р“Р°СЂРґРµСЂРѕР±',
  };

  return labels[type];
}

export function buildExchangeItemPageUrl(_item: {
  type: ExchangeItemType;
  id: number | string;
}): string | null {
  return null;
}

export function formatExchangeItem(item: ExchangeItemPayload): string {
  const label = getExchangeItemTypeLabel(item.type);
  const note = item.note?.trim();
  const title = item.title?.trim() || [item.brand, item.name].filter(Boolean).join(' ').trim();
  const itemLabel = title ? `${label}: ${title}` : `${label} Р±С–Р»СЊС€Рµ РЅРµРґРѕСЃС‚СѓРїРЅРёР№`;

  return note ? `${itemLabel} (${note})` : itemLabel;
}

export function formatRequestedExchangeItem(item: ExchangeRequestedShort): string {
  const title = item.title?.trim() || [item.brand, item.name].filter(Boolean).join(' ').trim();
  return title
    ? `${getExchangeItemTypeLabel(item.type)}: ${title}`
    : `${getExchangeItemTypeLabel(item.type)} Р±С–Р»СЊС€Рµ РЅРµРґРѕСЃС‚СѓРїРЅРёР№`;
}

export function formatExchangeItems(items: ExchangeItemPayload[]): string {
  if (!items.length) return 'РќРµ РІРёР±СЂР°РЅРѕ';
  return items.map(formatExchangeItem).join(', ');
}
