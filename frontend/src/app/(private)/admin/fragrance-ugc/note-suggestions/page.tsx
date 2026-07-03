import NoteSuggestionsAdminTable from '@/app/components/fragrances/ugc/NoteSuggestionsAdminTable';
import { fragranceAdminLabels as labels } from '@/app/components/fragrances/fragranceAdminLabels';
import { fragranceAdminStyles as styles } from '@/app/components/fragrances/fragranceAdmin.styles';
import { buildNoteSuggestionQuery } from '@/app/selectors/fragranceUgcSelectors';
import { getAdminNoteSuggestionsServer } from '@/app/services/fragranceUgcService.server';

import type { PageSearchParams } from '@/app/utils/searchParamsUtils';
import SimplePagination from '@/app/utils/SimplePagination';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';
import { paginatedTotal } from '@/app/utils/valueUtils';

const PAGE_SIZE = 25;

type AdminNoteSuggestionsPageProps = {
  searchParams: Promise<PageSearchParams>;
};

export default async function AdminNoteSuggestionsPage({
  searchParams,
}: AdminNoteSuggestionsPageProps) {
  const query = buildNoteSuggestionQuery(await searchParams);
  const data = await getAdminNoteSuggestionsServer({
    ...query,
    status: query.status ?? 'pending',
    page_size: PAGE_SIZE,
  });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{labels.noteSuggestions}</h1>
        <p className={styles.subtitle}>
          {labels.noteSuggestionsDescription}
        </p>
      </header>

      <NoteSuggestionsAdminTable items={data.results} />
      <SimplePagination page={Number(query.page || 1)} pageSize={PAGE_SIZE} totalItems={paginatedTotal(data)} hrefForPage={(page) => adminPageUrlBuilder.fragranceUgc.noteSuggestions({ ...query, page })} />
    </main>
  );
}
