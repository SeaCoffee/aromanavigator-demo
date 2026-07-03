import type { AppIconName } from "@/app/components/fragrances/AppLucideIcons";
import { adminPageUrlBuilder } from "@/app/urls/pageUrls/adminPageUrlBuilder";

export type AdminMenuLink = {
  label: string;
  href: string;
  icon: AppIconName;
  adminOnly?: boolean;
};

export type AdminMenuGroup = {
  title: string;
  links: AdminMenuLink[];
};

export const adminMenuGroups: AdminMenuGroup[] = [
  {
    title: "РћРіР»СЏРґ",
    links: [
      {
        label: "РђРґРјС–РЅ-РїР°РЅРµР»СЊ",
        href: adminPageUrlBuilder.home(),
        icon: "home",
      },
      {
        label: "РљРѕРЅС‚РµРЅС‚ СЃР°Р№С‚Сѓ",
        href: adminPageUrlBuilder.settings.siteContent(),
        icon: "edit",
      },
    ],
  },
  {
    title: "РљРѕСЂРёСЃС‚СѓРІР°С‡С– С‚Р° СЃРїС–Р»СЊРЅРѕС‚Р°",
    links: [
      {
        label: "РљРѕСЂРёСЃС‚СѓРІР°С‡С–",
        href: adminPageUrlBuilder.users.list(),
        icon: "users",
      },
      {
        label: "Р¤РѕСЂСѓРј",
        href: adminPageUrlBuilder.forum.list(),
        icon: "message",
      },
      {
        label: "РљРѕРјРµРЅС‚Р°СЂС–",
        href: adminPageUrlBuilder.comments.list(),
        icon: "message",
      },
      {
        label: "Р¤РѕС‚Рѕ",
        href: adminPageUrlBuilder.photos.list(),
        icon: "image",
      },
    ],
  },
  {
    title: "Р”РѕРІС–РґРЅРёРє Р°СЂРѕРјР°С‚С–РІ",
    links: [
      {
        label: "РљР°С‚Р°Р»РѕРі Р°СЂРѕРјР°С‚С–РІ",
        href: adminPageUrlBuilder.fragrances.list(),
        icon: "spray",
      },
      {
        label: "Р—Р°СЏРІРєРё РЅР° РґРѕРґР°РІР°РЅРЅСЏ",
        href: adminPageUrlBuilder.fragranceUgc.addRequests(),
        icon: "plus",
      },
      {
        label: "РџСЂРѕРїРѕР·РёС†С–С— РЅРѕС‚",
        href: adminPageUrlBuilder.fragranceUgc.noteSuggestions(),
        icon: "sparkles",
      },
      {
        label: "РЎС…РѕР¶С– Р°СЂРѕРјР°С‚Рё",
        href: adminPageUrlBuilder.fragranceUgc.similaritySuggestions(),
        icon: "refresh",
      },
    ],
  },
  {
    title: "РџСѓР±Р»С–РєР°С†С–С— С‚Р° Р·РІ'СЏР·РѕРє",
    links: [
      {
        label: "РЎС‚Р°С‚С‚С–",
        href: adminPageUrlBuilder.articles.moderation(),
        icon: "bookmark",
      },
      {
        label: "РћРіРѕР»РѕС€РµРЅРЅСЏ СЃР°Р№С‚Сѓ",
        href: adminPageUrlBuilder.notifications.announcements(),
        icon: "bell",
      },
      {
        label: "Р—РІРѕСЂРѕС‚РЅРёР№ Р·РІ'СЏР·РѕРє",
        href: adminPageUrlBuilder.feedback.list(),
        icon: "mail",
      },
    ],
  },
];
