import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { createTasteProfileApiUrlBuilder } from '@/app/urls/tasteProfileApiUrlBuilder.core';

export const tasteProfileAnonApiUrlBuilder = createTasteProfileApiUrlBuilder(
  apiRootFor('anonProxy', apiAppPaths.tasteProfile),
);
