import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { createFragranceApiUrlBuilder } from '@/app/urls/fragranceApiUrlBuilder.core';

export const fragranceAnonApiUrlBuilder = createFragranceApiUrlBuilder(
  apiRootFor('anonProxy', apiAppPaths.fragrance),
);
