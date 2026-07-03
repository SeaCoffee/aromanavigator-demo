// frontend/src/app/(public)/users/page.tsx

import type { Metadata } from 'next';

import { publicPageStyles as styles } from '@/app/components/common/publicPage.styles';
import PublicUserSearchForm from '@/app/components/users/PublicUserSearchForm';
import PublicUsersList from '@/app/components/users/PublicUsersList';
import { searchPublicUsersServer } from '@/app/services/userServices.server';
import type { Query } from '@/app/types/http';
import {
  cleanParam,
  pageParam,
  type SearchParamsRecord,
} from '@/app/utils/searchParamsUtils';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import { buildSeoMetadata } from '@/app/utils/seoMetadata';

export const metadata: Metadata = buildSeoMetadata({
  title: 'РљРѕСЂРёСЃС‚СѓРІР°С‡С–',
  description:
    'РџРѕС€СѓРє РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ РїР°СЂС„СѓРјРµСЂРЅРѕС— СЃРїС–Р»СЊРЅРѕС‚Рё: РїСЂРѕС„С–Р»С–, СЃС‚Р°С‚С‚С–, РіР°СЂРґРµСЂРѕР±, РІС–РґРіСѓРєРё, РїС–РґРїРёСЃРЅРёРєРё С‚Р° РѕРіРѕР»РѕС€РµРЅРЅСЏ.',
  path: userPageUrlBuilder.search(),
});

type Props = {
  searchParams?: Promise<SearchParamsRecord>;
};

function toQuery(params: SearchParamsRecord): Query {
  const query: Query = {};

  const q = cleanParam(params.q);
  const page = pageParam(params.page);

  if (q) query.q = q;
  if (page) query.page = page;

  return query;
}

export default async function PublicUsersPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const query = toQuery(params);

  const users = await searchPublicUsersServer(query);

 return (
  <main className={styles.page}>
    <div className={styles.container}>
      <div className={styles.headerText}>
        <h1 className={styles.title}>РљРѕСЂРёСЃС‚СѓРІР°С‡С–</h1>
        <p className={styles.lead}>
          Р—РЅР°Р№РґС–С‚СЊ РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ Р·Р° РїСѓР±Р»С–С‡РЅРёРј С–РјКјСЏРј Р°Р±Рѕ С–РјКјСЏРј РїСЂРѕС„С–Р»СЋ.
        </p>
      </div>

      <PublicUserSearchForm
        params={params}
        resetHref={userPageUrlBuilder.search()}
      />

      <PublicUsersList
        users={users}
        params={params}
        searchHref={userPageUrlBuilder.search}
      />
    </div>
  </main>
);
}
