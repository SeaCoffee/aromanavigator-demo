import { fragranceAnonApiUrlBuilder } from '@/app/urls/fragranceAnonApiUrlBuilder';
import { fragranceDjangoApiUrlBuilder } from '@/app/urls/fragranceDjangoApiUrlBuilder';
import { fragranceUserApiUrlBuilder } from '@/app/urls/fragranceUserApiUrlBuilder';

export const fragranceApiUrlBuilder = {
  server: fragranceDjangoApiUrlBuilder,
  anon: fragranceAnonApiUrlBuilder,
  user: fragranceUserApiUrlBuilder,
} as const;
