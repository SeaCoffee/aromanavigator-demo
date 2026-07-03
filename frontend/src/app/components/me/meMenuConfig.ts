import type { AppIconName } from '@/app/components/fragrances/AppLucideIcons';
import { fragranceUgcPageUrlBuilder } from '@/app/urls/pageUrls/fragranceUgcPageUrlBuilder';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';

export type MeMenuLink = {
  label: string;
  href: string;
  icon: AppIconName;
};

export type MeMenuGroup = {
  title: string;
  links: MeMenuLink[];
};

export function getMeMenuGroups(): MeMenuGroup[] {
  return [
    {
      title: 'Р“РѕР»РѕРІРЅРµ',
      links: [
        { label: 'РћСЃРѕР±РёСЃС‚РёР№ РєР°Р±С–РЅРµС‚', href: mePageUrlBuilder.home(), icon: 'home' },
        {
          label: 'РџР°СЂС„СѓРјРµСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ',
          href: mePageUrlBuilder.perfumeProfile.detail(),
          icon: 'sparkles',
        },
        {
          label: 'Р“Р°СЂРґРµСЂРѕР±',
          href: mePageUrlBuilder.wardrobe.list(),
          icon: 'spray',
        },
        {
          label: 'РћР±СЂР°РЅРµ',
          href: mePageUrlBuilder.favorites.list(),
          icon: 'heart',
        },
      ],
    },
    {
      title: 'РћР±РјС–РЅ С– СЃРїС–Р»СЊРЅРѕС‚Р°',
      links: [
        {
          label: 'РћР±РјС–РЅРё',
          href: mePageUrlBuilder.exchange.list(),
          icon: 'refresh',
        },
        {
          label: 'РЎС‚СЂС–С‡РєР° Р°РєС‚РёРІРЅРѕСЃС‚С–',
          href: mePageUrlBuilder.activity.feed(),
          icon: 'users',
        },
        {
          label: 'РЎРїРѕРІС–С‰РµРЅРЅСЏ',
          href: mePageUrlBuilder.notifications.list(),
          icon: 'bell',
        },
        {
          label: 'Р—РЅР°Р№С‚Рё РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ',
          href: mePageUrlBuilder.users.search(),
          icon: 'search',
        },
      ],
    },
    {
      title: 'РџСѓР±Р»С–РєР°С†С–С—',
      links: [
        {
          label: 'РњРѕС— СЃС‚Р°С‚С‚С–',
          href: mePageUrlBuilder.articles.list(),
          icon: 'bookmark',
        },
        {
          label: 'Р—Р°СЏРІРєРё РґРѕ РґРѕРІС–РґРЅРёРєР°',
          href: fragranceUgcPageUrlBuilder.me.addRequests(),
          icon: 'spray',
        },
      ],
    },
    {
      title: 'РќР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ',
      links: [
        {
          label: 'Р РµРґР°РіСѓРІР°С‚Рё РїСЂРѕС„С–Р»СЊ',
          href: mePageUrlBuilder.profile.edit(),
          icon: 'user',
        },
        {
          label: 'Р‘РµР·РїРµРєР° Р°РєР°СѓРЅС‚Р°',
          href: mePageUrlBuilder.profile.security(),
          icon: 'settings',
        },
      ],
    },
  ];
}
