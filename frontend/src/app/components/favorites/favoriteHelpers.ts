import type { FavoriteSerializedItem } from '@/app/types/favoriteTypes';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { pickMediaUrl } from '@/app/utils/MediaUrlUtils';
import { getEntityTypeLabel } from '@/app/utils/entityDisplayUtils';

export type FavoriteGroupKey =
  | 'fragrance'
  | 'forumTopic'
  | 'unavailable'
  | 'other';

export const favoriteGroupOrder: FavoriteGroupKey[] = [
  'fragrance',
  'forumTopic',
  'unavailable',
  'other',
];

const favoriteGroupLabels: Record<FavoriteGroupKey, string> = {
  fragrance: 'РђСЂРѕРјР°С‚Рё',
  forumTopic: 'РўРµРјРё С„РѕСЂСѓРјСѓ',
  unavailable: 'РќРµРґРѕСЃС‚СѓРїРЅС– РѕР±КјС”РєС‚Рё',
  other: 'Р†РЅС€Рµ',
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readId(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : null;
}

function getApp(item: FavoriteSerializedItem | null): string {
  return readString(item?.app).toLowerCase();
}

function getModel(item: FavoriteSerializedItem | null): string {
  return readString(item?.model).toLowerCase();
}

export function getFavoriteItemGroup(
  item: FavoriteSerializedItem | null,
): FavoriteGroupKey {
  if (!item || item.is_available === false) {
    return 'unavailable';
  }

  const app = getApp(item);
  const model = getModel(item);

  if (app === 'fragrance' && model === 'fragrancemodel') {
    return 'fragrance';
  }

  if (app === 'forum' && model === 'forumtopicmodel') {
    return 'forumTopic';
  }

  return 'other';
}

export function getFavoriteGroupLabel(group: FavoriteGroupKey): string {
  return favoriteGroupLabels[group];
}

export function getFavoriteItemTitle(item: FavoriteSerializedItem | null): string {
  if (!item) {
    return 'РћР±КјС”РєС‚ РЅРµРґРѕСЃС‚СѓРїРЅРёР№';
  }

  if (item.is_available === false) {
    if (item.unavailable_reason === 'deleted') {
      return 'РћР±КјС”РєС‚ РІРёРґР°Р»РµРЅРѕ';
    }

    return 'РћР±КјС”РєС‚ РЅРµРґРѕСЃС‚СѓРїРЅРёР№';
  }

  const direct =
    readString(item.title) ||
    readString(item.name) ||
    readString(item.display_name);

  if (direct) {
    return direct;
  }

  const brand = item.brand;

  if (typeof brand === 'string' && brand) {
    return brand;
  }

  if (brand && typeof brand === 'object' && 'name' in brand) {
    const brandName = readString(brand.name);

    if (brandName) {
      return brandName;
    }
  }

  if (item.app && item.model && item.id) {
    return getEntityTypeLabel(item);
  }

  return 'РћР±СЂР°РЅРµ';
}

export function getFavoriteItemImage(item: FavoriteSerializedItem | null): string {
  if (!item || item.is_available === false) {
    return '';
  }

  return pickMediaUrl(item, item.cover_image, item.image_url, item.cover);
}

export function getFavoriteItemHref(item: FavoriteSerializedItem | null): string | null {
  if (!item || item.is_available === false) {
    return null;
  }

  const id = readId(item.id);
  const slug = readString(item.slug);
  const group = getFavoriteItemGroup(item);

  if (group === 'fragrance') {
    if (slug) {
      return fragrancePageUrlBuilder.public.detail(slug);
    }

    if (id) {
      return fragrancePageUrlBuilder.public.list({
        fragrance_id: String(id),
      });
    }

    return fragrancePageUrlBuilder.public.list();
  }

  if (group === 'forumTopic' && id) {
    return forumPageUrlBuilder.topics.detail(id);
  }

  return null;
}

export function getFavoriteItemMeta(item: FavoriteSerializedItem | null): string {
  if (!item) {
    return '';
  }

  if (item.is_available === false) {
    if (item.unavailable_reason === 'deleted') {
      return 'Р’РёРґР°Р»РµРЅРѕ';
    }

    if (item.unavailable_reason === 'blocked') {
      return 'РќРµРґРѕСЃС‚СѓРїРЅРѕ С‡РµСЂРµР· РѕР±РјРµР¶РµРЅРЅСЏ';
    }

    return 'РќРµРґРѕСЃС‚СѓРїРЅРѕ';
  }

  const app = readString(item.app);
  const model = readString(item.model);

  if (app === 'fragrance' && model === 'fragrancemodel') {
    const brand = item.brand;

    if (typeof brand === 'string' && brand) {
      return brand;
    }

    if (brand && typeof brand === 'object') {
      const brandName = readString(brand.name);

      if (brandName) {
        return brandName;
      }
    }

    return 'РђСЂРѕРјР°С‚';
  }

  if (app === 'forum' && model === 'forumtopicmodel') {
    const commentsCount = readNumber(item.comments_count);

    if (commentsCount !== null) {
      return `РўРµРјР° С„РѕСЂСѓРјСѓ В· РљРѕРјРµРЅС‚Р°СЂС–РІ: ${commentsCount}`;
    }

    return 'РўРµРјР° С„РѕСЂСѓРјСѓ';
  }

  if (app && model) {
    return getEntityTypeLabel({ app, model });
  }

  return '';
}
