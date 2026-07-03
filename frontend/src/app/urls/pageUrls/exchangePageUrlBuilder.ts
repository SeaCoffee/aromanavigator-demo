// src/app/urls/pageUrls/exchangePageUrlBuilder.ts
import { build, seg } from '@/app/utils/urlUtils';
import type { Query } from '@/app/types/http';
import type { ExchangeItemType } from '@/app/types/exchangeTypes';

const EXCHANGE_PUBLIC_ROOT = '/exchange';
const EXCHANGE_ME_ROOT = '/me/exchange';

export const exchangePageUrlBuilder = {
  new: (query?: Query) => build(`${EXCHANGE_PUBLIC_ROOT}/new`, query),

  newForItem: (item: {
    requested_type: ExchangeItemType;
    requested_id: number | string;
    owner_id: number | string;
  }) =>
    build(`${EXCHANGE_PUBLIC_ROOT}/new`, {
      requested_type: item.requested_type,
      requested_id: item.requested_id,
      owner_id: item.owner_id,
    }),
} as const;

export const meExchangePageUrlBuilder = {
  index: (query?: Query) => build(EXCHANGE_ME_ROOT, query),

  sent: (query?: Query) => build(`${EXCHANGE_ME_ROOT}/sent`, query),
  received: (query?: Query) => build(`${EXCHANGE_ME_ROOT}/received`, query),

  detail: (id: number | string) =>
    build(`${EXCHANGE_ME_ROOT}/${seg(id)}`),
} as const;
