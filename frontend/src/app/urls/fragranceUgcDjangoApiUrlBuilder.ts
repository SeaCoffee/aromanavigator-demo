import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { createFragranceUgcApiUrlBuilder } from '@/app/urls/fragranceUgcApiUrlBuilder.core';

export const fragranceUgcDjangoApiUrlBuilder =
  createFragranceUgcApiUrlBuilder(
    apiRootFor('django', apiAppPaths.fragranceUgc),
  );
