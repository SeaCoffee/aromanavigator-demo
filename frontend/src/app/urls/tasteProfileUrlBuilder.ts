import { tasteProfileAnonApiUrlBuilder } from '@/app/urls/tasteProfileAnonApiUrlBuilder';
import { tasteProfileDjangoApiUrlBuilder } from '@/app/urls/tasteProfileDjangoApiUrlBuilder';
import { tasteProfileUserApiUrlBuilder } from '@/app/urls/tasteProfileUserApiUrlBuilder';

export const tasteProfileApiUrlBuilder = {
  server: tasteProfileDjangoApiUrlBuilder,
  anon: tasteProfileAnonApiUrlBuilder,
  user: tasteProfileUserApiUrlBuilder,
} as const;
