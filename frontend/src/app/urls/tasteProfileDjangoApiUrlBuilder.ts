import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { createTasteProfileApiUrlBuilder } from '@/app/urls/tasteProfileApiUrlBuilder.core';

export const tasteProfileDjangoApiUrlBuilder = createTasteProfileApiUrlBuilder(
  apiRootFor('django', apiAppPaths.tasteProfile),
);
