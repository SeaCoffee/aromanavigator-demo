import type { ArticleStatus } from '@/app/types/articleTypes';

export const ARTICLE_DEFAULT_STATUS: ArticleStatus = 'draft';

export const ARTICLE_AUTHOR_STATUS_OPTIONS = [
  {
    value: 'draft',
    label: 'Р§РµСЂРЅРµС‚РєР°',
  },
  {
    value: 'pending',
    label: 'РќР° РјРѕРґРµСЂР°С†С–СЋ',
  },
] as const satisfies readonly {
  value: ArticleStatus;
  label: string;
}[];

export const ARTICLE_STATUS_OPTIONS = [
  {
    value: 'draft',
    label: 'Р§РµСЂРЅРµС‚РєР°',
  },
  {
    value: 'pending',
    label: 'РќР° РјРѕРґРµСЂР°С†С–С—',
  },
  {
    value: 'published',
    label: 'РћРїСѓР±Р»С–РєРѕРІР°РЅРѕ',
  },
  {
    value: 'rejected',
    label: 'Р’С–РґС…РёР»РµРЅРѕ',
  },
] as const satisfies readonly {
  value: ArticleStatus;
  label: string;
}[];
