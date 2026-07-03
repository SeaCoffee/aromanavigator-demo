import type { Metadata } from 'next';

import SocialUserList from '@/app/components/social/SocialUserList';
import { socialUserListStyles as styles } from '@/app/components/social/socialUserList.styles';
import { requireUserOrRedirect } from '@/app/lib/session';
import { getFollowingServer } from '@/app/services/socialServices.server';
import { paginatedTotal } from '@/app/utils/valueUtils';
import SimplePagination from '@/app/utils/SimplePagination';
import { currentPageFromParams } from '@/app/utils/searchParamsUtils';
import { socialPageUrlBuilder } from '@/app/urls/pageUrls/socialPageUrlBuilder';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'РњРѕС— РїС–РґРїРёСЃРєРё',
};

type PageProps = {
  searchParams?: Promise<{ page?: string }>;
};

export default async function MyFollowingPage({ searchParams }: PageProps) {
  const user = await requireUserOrRedirect();
  const params = searchParams ? await searchParams : {};
  const following = await getFollowingServer(user.id, { page: params.page });
  const page = currentPageFromParams(params);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>РњРѕС— РїС–РґРїРёСЃРєРё</h1>
        <p className={styles.subtitle}>РљРѕСЂРёСЃС‚СѓРІР°С‡С–, Р·Р° СЏРєРёРјРё РІРё СЃС‚РµР¶РёС‚Рµ.</p>
      </header>

      <span className={styles.summary}>РЈСЃСЊРѕРіРѕ: {paginatedTotal(following)}</span>
      <SocialUserList
        users={following.results}
        emptyText="Р’Рё РїРѕРєРё РЅРµ РїС–РґРїРёСЃР°РЅС– РЅР° РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ."
      />
      <SimplePagination
        page={page}
        pageSize={20}
        totalItems={paginatedTotal(following)}
        hrefForPage={(nextPage) => socialPageUrlBuilder.following({ page: nextPage })}
      />
    </main>
  );
}
