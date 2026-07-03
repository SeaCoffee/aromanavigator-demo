import type { Metadata } from 'next';

import SubscriptionList from '@/app/components/social/SubscriptionList';
import { socialStyles } from '@/app/components/social/socialStyles';
import { requireUserOrRedirect } from '@/app/lib/session';
import { getMySubscriptionsServer } from '@/app/services/socialServices.server';
import type { SubscriptionListQuery } from '@/app/types/socialTypes';
import { socialPageUrlBuilder } from '@/app/urls/pageUrls/socialPageUrlBuilder';
import SimplePagination from '@/app/utils/SimplePagination';
import { currentPageFromParams } from '@/app/utils/searchParamsUtils';
import { paginatedTotal } from '@/app/utils/valueUtils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'РњРѕС— С„РѕСЂСѓРјРЅС– РїС–РґРїРёСЃРєРё',
};

type PageProps = {
  searchParams?: Promise<{
    app?: string;
    model?: string;
    id?: string;
    page?: string;
  }>;
};

function cleanQuery(
  params: Awaited<NonNullable<PageProps['searchParams']>>,
): SubscriptionListQuery {
  const query: SubscriptionListQuery = {};

  if (params.app) query.app = params.app;
  if (params.model) query.model = params.model;
  if (params.id) query.id = params.id;
  if (params.page) query.page = params.page;

  return query;
}

export default async function MySubscriptionsPage({ searchParams }: PageProps) {
  await requireUserOrRedirect();

  const params = searchParams ? await searchParams : {};
  const subscriptions = await getMySubscriptionsServer(cleanQuery(params));
  const page = currentPageFromParams(params);

  return (
    <main className={socialStyles.page}>
      <header className={socialStyles.header}>
        <h1 className={socialStyles.title}>РњРѕС— С„РѕСЂСѓРјРЅС– РїС–РґРїРёСЃРєРё</h1>
        <p className={socialStyles.subtitle}>
          РўРµРјРё С‚Р° СЂРѕР·РґС–Р»Рё С„РѕСЂСѓРјСѓ, Р·Р° СЏРєРёРјРё РІРё СЃС‚РµР¶РёС‚Рµ.
        </p>
      </header>

      <section className={socialStyles.sections}>
        <div className={socialStyles.summaryCard}>
          РЈСЃСЊРѕРіРѕ С„РѕСЂСѓРјРЅРёС… РїС–РґРїРёСЃРѕРє:{' '}
          <strong className={socialStyles.summaryStrong}>
            {paginatedTotal(subscriptions)}
          </strong>
        </div>

        <SubscriptionList subscriptions={subscriptions.results} />
        <SimplePagination
          page={page}
          pageSize={20}
          totalItems={paginatedTotal(subscriptions)}
          hrefForPage={(nextPage) =>
            socialPageUrlBuilder.subscriptions({ ...cleanQuery(params), page: nextPage })
          }
        />
      </section>
    </main>
  );
}
