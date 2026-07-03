import { fragranceUgcAnonApiUrlBuilder } from '@/app/urls/fragranceUgcAnonApiUrlBuilder';
import { fragranceUgcDjangoApiUrlBuilder } from '@/app/urls/fragranceUgcDjangoApiUrlBuilder';
import { fragranceUgcUserApiUrlBuilder } from '@/app/urls/fragranceUgcUserApiUrlBuilder';

export const fragranceUgcApiUrlBuilder = {
  server: fragranceUgcDjangoApiUrlBuilder,
  anon: fragranceUgcAnonApiUrlBuilder,
  user: fragranceUgcUserApiUrlBuilder,
} as const;
