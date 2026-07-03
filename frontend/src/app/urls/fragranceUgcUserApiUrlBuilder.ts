import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { createFragranceUgcApiUrlBuilder } from '@/app/urls/fragranceUgcApiUrlBuilder.core';

export const fragranceUgcUserApiUrlBuilder = createFragranceUgcApiUrlBuilder(
  apiRootFor('userProxy', apiAppPaths.fragranceUgc),
);
