import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { createFragranceUgcApiUrlBuilder } from '@/app/urls/fragranceUgcApiUrlBuilder.core';

export const fragranceUgcAnonApiUrlBuilder = createFragranceUgcApiUrlBuilder(
  apiRootFor('anonProxy', apiAppPaths.fragranceUgc),
);
