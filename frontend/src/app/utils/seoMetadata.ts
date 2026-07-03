import type { Metadata } from 'next';

import { SITE_URL, siteUrl } from '@/app/constants/siteConstants';
import { normalizeMediaUrl } from '@/app/utils/MediaUrlUtils';

export const SITE_NAME = 'Aroma Navigator';

export const DEFAULT_SEO_TITLE =
  'Aroma Navigator - РґРѕРІС–РґРЅРёРє Р°СЂРѕРјР°С‚С–РІ С‚Р° РїР°СЂС„СѓРјРµСЂРЅР° СЃРїС–Р»СЊРЅРѕС‚Р°';

export const DEFAULT_SEO_DESCRIPTION =
  'Aroma Navigator РґРѕРїРѕРјР°РіР°С” Р·РЅР°С…РѕРґРёС‚Рё Р°СЂРѕРјР°С‚Рё Р·Р° РЅРѕС‚Р°РјРё, Р±СЂРµРЅРґР°РјРё, РїР°СЂС„СѓРјРµСЂР°РјРё, РІС–РґРіСѓРєР°РјРё С‚Р° РїСЂРѕРїРѕР·РёС†С–СЏРјРё РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ.';

export const DEFAULT_SEO_KEYWORDS = [
  'Р°СЂРѕРјР°С‚Рё',
  'РїР°СЂС„СѓРјРё',
  'РґРѕРІС–РґРЅРёРє Р°СЂРѕРјР°С‚С–РІ',
  'РЅРѕС‚Рё РїР°СЂС„СѓРјС–РІ',
  'Р±СЂРµРЅРґРё РїР°СЂС„СѓРјС–РІ',
  'РѕРіРѕР»РѕС€РµРЅРЅСЏ РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ',
  'РїР°СЂС„СѓРјРµСЂРЅР° СЃРїС–Р»СЊРЅРѕС‚Р°',
];

export const indexableRobots: Metadata['robots'] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
};

export const noIndexRobots: Metadata['robots'] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

type OpenGraphImages = NonNullable<Metadata['openGraph']>['images'];

type SeoMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  images?: OpenGraphImages;
  noIndex?: boolean;
  keywords?: string[];
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
};

export function truncateSeoText(value: string, maxLength = 155) {
  const clean = value.replace(/\s+/g, ' ').trim();

  if (clean.length <= maxLength) {
    return clean;
  }

  return `${clean.slice(0, maxLength - 1).trim()}вЂ¦`;
}

export function canonicalUrl(path = '/') {
  return siteUrl(normalizeMediaUrl(path) || path);
}

export function absoluteImageUrl(path: string | null | undefined) {
  if (!path) {
    return undefined;
  }

  return siteUrl(path);
}

export function buildSeoMetadata({
  title = DEFAULT_SEO_TITLE,
  description = DEFAULT_SEO_DESCRIPTION,
  path = '/',
  images,
  noIndex = false,
  keywords = DEFAULT_SEO_KEYWORDS,
  type = 'website',
  publishedTime,
  modifiedTime,
}: SeoMetadataInput = {}): Metadata {
  const canonical = canonicalUrl(path);
  const robots = noIndex ? noIndexRobots : indexableRobots;
  const openGraph =
    type === 'article'
      ? {
          title,
          description,
          url: canonical,
          siteName: SITE_NAME,
          locale: 'uk_UA',
          type,
          publishedTime,
          modifiedTime,
          images,
        }
      : {
          title,
          description,
          url: canonical,
          siteName: SITE_NAME,
          locale: 'uk_UA',
          type,
          images,
        };

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots,
    openGraph,
    twitter: {
      card: images ? 'summary_large_image' : 'summary',
      title,
      description,
      images,
    },
  };
}

export function buildNoIndexMetadata(
  title: string,
  description = DEFAULT_SEO_DESCRIPTION,
  path = '/',
) {
  return buildSeoMetadata({
    title,
    description,
    path,
    noIndex: true,
  });
}

export function getMetadataBase() {
  return new URL(SITE_URL);
}
