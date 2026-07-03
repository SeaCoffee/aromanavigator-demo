import { build, seg } from '@/app/utils/urlUtils';
import type { Query } from '@/app/types/http';
import {
  apiAppPaths,
  apiRootFor,
} from '@/app/constants/urlsConstants';

const EXCHANGE_DJANGO_API_ROOT = apiRootFor('django', apiAppPaths.exchange);
const EXCHANGE_USER_PROXY_API_ROOT = apiRootFor(
  'userProxy',
  apiAppPaths.exchange,
);

function createExchangeApiBuilder(root: string) {
  return {
    create: () => build(`${root}/`),

    sent: (query?: Query) => build(`${root}/sent`, query),
    received: (query?: Query) => build(`${root}/received`, query),

    formItems: () => build(`${root}/form-items`),
    createForm: (query: Query) => build(`${root}/create-form`, query),

    detail: (id: number | string) => build(`${root}/${seg(id)}`),

    accept: (id: number | string) => build(`${root}/${seg(id)}/accept`),
    reject: (id: number | string) => build(`${root}/${seg(id)}/reject`),
    cancel: (id: number | string) => build(`${root}/${seg(id)}/cancel`),
  } as const;
}

export const exchangeApiUrlBuilder = {
  server: createExchangeApiBuilder(EXCHANGE_DJANGO_API_ROOT),
  user: createExchangeApiBuilder(EXCHANGE_USER_PROXY_API_ROOT),
} as const;
