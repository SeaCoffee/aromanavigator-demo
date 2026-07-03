import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { createTasteProfileApiUrlBuilder } from '@/app/urls/tasteProfileApiUrlBuilder.core';

export const tasteProfileUserApiUrlBuilder = createTasteProfileApiUrlBuilder(
  apiRootFor('userProxy', apiAppPaths.tasteProfile),
);
