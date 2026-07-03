import type { Metadata } from 'next';

import SocialUserList from '@/app/components/social/SocialUserList';
import { socialUserListStyles as styles } from '@/app/components/social/socialUserList.styles';
import { requireUserOrRedirect } from '@/app/lib/session';
import { getFollowersServer } from '@/app/services/socialServices.server';
import { paginatedTotal } from '@/app/utils/valueUtils';
import SimplePagination from '@/app/utils/SimplePagination';
import { currentPageFromParams } from '@/app/utils/searchParamsUtils';
import { socialPageUrlBuilder } from '@/app/urls/pageUrls/socialPageUrlBuilder';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'РњРѕС— РїС–РґРїРёСЃРЅРёРєРё',
};

type PageProps = {
  searchParams?: Promise<{ page?: string }>;
};

export default async function MyFollowersPage({ searchParams }: PageProps) {
  const user = await requireUserOrRedirect();
  const params = searchParams ? await searchParams : {};
  const followers = await getFollowersServer(user.id, { page: params.page });
  const page = currentPageFromParams(params);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>РњРѕС— РїС–РґРїРёСЃРЅРёРєРё</h1>
        <p className={styles.subtitle}>
          РљРѕСЂРёСЃС‚СѓРІР°С‡С–, СЏРєС– СЃС‚РµР¶Р°С‚СЊ Р·Р° РІР°С€РёРј РїСЂРѕС„С–Р»РµРј.
        </p>
      </header>

      <span className={styles.summary}>РЈСЃСЊРѕРіРѕ: {paginatedTotal(followers)}</span>
      <SocialUserList
        users={followers.results}
        emptyText="РќР° РІР°СЃ РїРѕРєРё РЅС–С…С‚Рѕ РЅРµ РїС–РґРїРёСЃР°РЅРёР№."
      />
      <SimplePagination
        page={page}
        pageSize={20}
        totalItems={paginatedTotal(followers)}
        hrefForPage={(nextPage) => socialPageUrlBuilder.followers({ page: nextPage })}
      />
    </main>
  );
}
