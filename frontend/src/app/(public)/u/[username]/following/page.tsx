import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PublicSocialListGate from '@/app/components/social/PublicSocialListGate';
import SocialUserList from '@/app/components/social/SocialUserList';
import { socialUserListStyles as styles } from '@/app/components/social/socialUserList.styles';
import { getFollowingServer } from '@/app/services/socialServices.server';
import { getPublicUserByUsernameServer } from '@/app/services/userServices.server';
import { paginatedTotal } from '@/app/utils/valueUtils';
import { ApiError } from '@/errors/ApiError';
import SimplePagination from '@/app/utils/SimplePagination';
import { currentPageFromParams } from '@/app/utils/searchParamsUtils';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'РџС–РґРїРёСЃРєРё РєРѕСЂРёСЃС‚СѓРІР°С‡Р°',
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

export default async function PublicUserFollowingPage({
  params,
  searchParams,
}: PageProps) {
  const { username } = await params;
  const query = searchParams ? await searchParams : {};

  try {
    const profileUser = await getPublicUserByUsernameServer(username);
    const following = await getFollowingServer(profileUser.id, {
      page: query.page,
    });
    const page = currentPageFromParams(query);

    return (
      <PublicSocialListGate
        profileUser={profileUser}
        title="РџС–РґРїРёСЃРєРё"
        description="РљРѕСЂРёСЃС‚СѓРІР°С‡С–, Р·Р° СЏРєРёРјРё СЃС‚РµР¶РёС‚СЊ С†РµР№ РїСЂРѕС„С–Р»СЊ."
      >
        <section className="grid gap-3">
          <p className={styles.summary}>РЈСЃСЊРѕРіРѕ: {paginatedTotal(following)}</p>
          <SocialUserList
            users={following.results}
            emptyText="Р¦РµР№ РєРѕСЂРёСЃС‚СѓРІР°С‡ РїРѕРєРё РЅС– РЅР° РєРѕРіРѕ РЅРµ РїС–РґРїРёСЃР°РЅРёР№."
          />
          <SimplePagination
            page={page}
            pageSize={20}
            totalItems={paginatedTotal(following)}
            hrefForPage={(nextPage) =>
              userPageUrlBuilder.following(username, { page: nextPage })
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
