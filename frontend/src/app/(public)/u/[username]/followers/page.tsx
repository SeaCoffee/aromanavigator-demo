import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PublicSocialListGate from '@/app/components/social/PublicSocialListGate';
import SocialUserList from '@/app/components/social/SocialUserList';
import { socialUserListStyles as styles } from '@/app/components/social/socialUserList.styles';
import { getFollowersServer } from '@/app/services/socialServices.server';
import { getPublicUserByUsernameServer } from '@/app/services/userServices.server';
import { paginatedTotal } from '@/app/utils/valueUtils';
import { ApiError } from '@/errors/ApiError';
import SimplePagination from '@/app/utils/SimplePagination';
import { currentPageFromParams } from '@/app/utils/searchParamsUtils';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'РџС–РґРїРёСЃРЅРёРєРё РєРѕСЂРёСЃС‚СѓРІР°С‡Р°',
};

type PageProps = {
  params: Promise<{
    username: string;
  }>;
  searchParams?: Promise<{
    page?: string;
  }>;
};

function isNotFoundError(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

export default async function PublicUserFollowersPage({
  params,
  searchParams,
}: PageProps) {
  const { username } = await params;
  const query = searchParams ? await searchParams : {};

  try {
    const profileUser = await getPublicUserByUsernameServer(username);
    const followers = await getFollowersServer(profileUser.id, {
      page: query.page,
    });
    const page = currentPageFromParams(query);

    return (
      <PublicSocialListGate
        profileUser={profileUser}
        title="РџС–РґРїРёСЃРЅРёРєРё"
        description="РљРѕСЂРёСЃС‚СѓРІР°С‡С–, СЏРєС– СЃС‚РµР¶Р°С‚СЊ Р·Р° С†РёРј РїСЂРѕС„С–Р»РµРј."
      >
        <section className="grid gap-3">
          <p className={styles.summary}>РЈСЃСЊРѕРіРѕ: {paginatedTotal(followers)}</p>
          <SocialUserList
            users={followers.results}
            emptyText="РЈ С†СЊРѕРіРѕ РєРѕСЂРёСЃС‚СѓРІР°С‡Р° РїРѕРєРё РЅРµРјР°С” РїС–РґРїРёСЃРЅРёРєС–РІ."
          />
          <SimplePagination
            page={page}
            pageSize={20}
            totalItems={paginatedTotal(followers)}
            hrefForPage={(nextPage) =>
              userPageUrlBuilder.followers(username, { page: nextPage })
            }
          />
        </section>
      </PublicSocialListGate>
    );
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }

    throw error;
  }
}
