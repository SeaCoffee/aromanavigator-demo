// frontend/src/app/(private)/me/activity/page.tsx

import ActivityEventList from '@/app/components/activity/ActivityEventList';
import { activityStyles } from '@/app/components/activity/activityStyles';
import { requireUserOrRedirect } from '@/app/lib/session';
import { getMyActivityFeedServer } from '@/app/services/activityServerServices';
import type { Query } from '@/app/types/http';
import SimplePagination from '@/app/utils/SimplePagination';
import {
  buildPageQuery,
  currentPageFromParams,
} from '@/app/utils/searchParamsUtils';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getQuery(searchParams?: Record<string, string | string[] | undefined>): Query {
  const page = searchParams?.page;

  return {
    page: typeof page === 'string' ? page : undefined,
  };
}

export default async function MyActivityPage({ searchParams }: Props) {
  await requireUserOrRedirect();

  const resolvedSearchParams = await searchParams;
  const eventsPage = await getMyActivityFeedServer(getQuery(resolvedSearchParams));
  const page = currentPageFromParams(resolvedSearchParams ?? {});

  return (
    <main className={activityStyles.page}>
      <header className={activityStyles.header}>
        <h1 className={activityStyles.title}>РЎС‚СЂС–С‡РєР° РЅРѕРІРёРЅ</h1>
        <p className={activityStyles.subtitle}>
          РџРѕРґС–С— СЃРїС–Р»СЊРЅРѕС‚Рё: РєРѕРјРµРЅС‚Р°СЂС–, РІРїРѕРґРѕР±Р°РЅРЅСЏ, РѕРЅРѕРІР»РµРЅРЅСЏ С‚Р° С–РЅС€С– РґС–С—.
        </p>
      </header>

      <ActivityEventList events={eventsPage.results} />
      <SimplePagination
        page={page}
        pageSize={20}
        totalItems={eventsPage.total_items}
        hrefForPage={(nextPage) =>
          mePageUrlBuilder.activity.feed(
            buildPageQuery(resolvedSearchParams ?? {}, nextPage),
          )
        }
      />
    </main>
  );
}
