import type { AppIconName } from '@/app/components/fragrances/AppLucideIcons';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { sitePageUrlBuilder } from '@/app/urls/pageUrls/sitePageUrlBuilder';

export type SiteHeaderNavItem = {
  label: string;
  href: string;
};

export type SiteHeaderActionItem = {
  label: string;
  href: string;
  icon: AppIconName;
};

export const siteHeaderNavItems: SiteHeaderNavItem[] = [
  {
    label: 'Р”РѕРІС–РґРЅРёРє',
    href: fragrancePageUrlBuilder.public.list(),
  },
  {
    label: 'Р¤РѕСЂСѓРј',
    href: sitePageUrlBuilder.public.forum(),
  },
  {
    label: 'РЎС‚Р°С‚С‚С–',
    href: sitePageUrlBuilder.public.articles(),
  },
];

export const siteHeaderActionItems: SiteHeaderActionItem[] = [
  {
    label: 'РџРѕС€СѓРє',
    href: fragrancePageUrlBuilder.public.list(),
    icon: 'search',
  },
  {
    label: 'РџСЂРѕС„С–Р»СЊ',
    href: sitePageUrlBuilder.private.profile(),
    icon: 'account',
  },
];

export const siteHeaderStripText =
  'Р•РЅС†РёРєР»РѕРїРµРґС–СЏ Р°СЂРѕРјР°С‚С–РІ В· РЅРѕС‚Рё В· Р±СЂРµРЅРґРё В· РїР°СЂС„СѓРјРµСЂРё В· РіР°СЂРґРµСЂРѕР± В· РѕР±РјС–РЅ';
