import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ActivityEventList from '@/app/components/activity/ActivityEventList';
import { activityStyles } from '@/app/components/activity/activityStyles';
import { getUserActivityFeedByDisplayNameServer } from '@/app/services/activityServerServices';
import { getPublicUserByUsernameServer } from '@/app/services/userServices.server';
import type { Query } from '@/app/types/http';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import SimplePagination from '@/app/utils/SimplePagination';
import {
  buildPageQuery,
  currentPageFromParams,
} from '@/app/utils/searchParamsUtils';
import { getPublicUserDisplayName } from '@/app/utils/userDisplayUtils';
import { ApiError } from '@/errors/ApiError';

const PAGE_SIZE = 20;

type Props = {
  params: Promise<{
    username: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function isNotFoundError(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

function getQuery(
  searchParams?: Record<string, string | string[] | undefined>,
): Query {
  const page = searchParams?.page;

  return {
    page: typeof page === 'string' ? page : undefined,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `РђРєС‚РёРІРЅС–СЃС‚СЊ ${username}`,
  };
}

export default async function PublicUserActivityPage({
  params,
  searchParams,
}: Props) {
  const { username } = await params;
  const resolvedSearchParams = await searchParams;

  try {
    const publicUser = await getPublicUserByUsernameServer(username);
    const displayName = getPublicUserDisplayName(publicUser);
    const eventsPage = await getUserActivityFeedByDisplayNameServer(
      displayName,
      getQuery(resolvedSearchParams),
    );
    const page = currentPageFromParams(resolvedSearchParams ?? {});

    return (
      <main className={activityStyles.page}>
        <header className={activityStyles.header}>
          <h1 className={activityStyles.title}>
            РђРєС‚РёРІРЅС–СЃС‚СЊ {displayName}
          </h1>
          <p className={activityStyles.subtitle}>
            РџСѓР±Р»С–С‡РЅС– РїРѕРґС–С— РєРѕСЂРёСЃС‚СѓРІР°С‡Р°: РѕРіРѕР»РѕС€РµРЅРЅСЏ, РєРѕРјРµРЅС‚Р°СЂС–, РІРїРѕРґРѕР±Р°РЅРЅСЏ,
            РїС–РґРїРёСЃРєРё С‚Р° С–РЅС€С– РґС–С—, СЏРєС– РЅРµ РїСЂРёС…РѕРІР°РЅС– РЅР°Р»Р°С€С‚СѓРІР°РЅРЅСЏРјРё РїСЂРёРІР°С‚РЅРѕСЃС‚С–.
          </p>
        </header>

        <ActivityEventList
          events={eventsPage.results}
          emptyText="РџСѓР±Р»С–С‡РЅРѕС— Р°РєС‚РёРІРЅРѕСЃС‚С– РїРѕРєРё РЅРµРјР°С”."
        />

        <SimplePagination
          page={page}
          pageSize={PAGE_SIZE}
          totalItems={eventsPage.total_items}
          hrefForPage={(nextPage) =>
            userPageUrlBuilder.activity(
              username,
              buildPageQuery(resolvedSearchParams ?? {}, nextPage),
            )
          }
        />
      </main>
    );
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }

    throw error;
  }
}
