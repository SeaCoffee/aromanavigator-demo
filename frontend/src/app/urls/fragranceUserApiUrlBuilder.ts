import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { createFragranceApiUrlBuilder } from '@/app/urls/fragranceApiUrlBuilder.core';

export const fragranceUserApiUrlBuilder = createFragranceApiUrlBuilder(
  apiRootFor('userProxy', apiAppPaths.fragrance),
);
