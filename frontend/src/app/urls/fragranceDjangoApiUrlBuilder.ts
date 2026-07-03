import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';
import { createFragranceApiUrlBuilder } from '@/app/urls/fragranceApiUrlBuilder.core';

export const fragranceDjangoApiUrlBuilder = createFragranceApiUrlBuilder(
  apiRootFor('django', apiAppPaths.fragrance),
);
