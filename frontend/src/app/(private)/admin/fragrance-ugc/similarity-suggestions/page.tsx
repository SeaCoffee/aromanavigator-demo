import SimilaritySuggestionsAdminTable from '@/app/components/fragrances/ugc/SimilaritySuggestionsAdminTable';
import { fragranceAdminLabels as labels } from '@/app/components/fragrances/fragranceAdminLabels';
import { fragranceAdminStyles as styles } from '@/app/components/fragrances/fragranceAdmin.styles';
import { buildSimilaritySuggestionQuery } from '@/app/selectors/fragranceUgcSelectors';
import { getAdminSimilaritySuggestionsServer } from '@/app/services/fragranceUgcService.server';

import type { PageSearchParams } from '@/app/utils/searchParamsUtils';
import SimplePagination from '@/app/utils/SimplePagination';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';
import { paginatedTotal } from '@/app/utils/valueUtils';

const PAGE_SIZE = 25;

type AdminSimilaritySuggestionsPageProps = {
  searchParams: Promise<PageSearchParams>;
};

export default async function AdminSimilaritySuggestionsPage({
  searchParams,
}: AdminSimilaritySuggestionsPageProps) {
  const query = buildSimilaritySuggestionQuery(await searchParams);
  const data = await getAdminSimilaritySuggestionsServer({
    ...query,
    status: query.status ?? 'pending',
    page_size: PAGE_SIZE,
  });

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{labels.similaritySuggestions}</h1>
        <p className={styles.subtitle}>
          {labels.similaritySuggestionsDescription}
        </p>
      </header>

      <SimilaritySuggestionsAdminTable items={data.results} />
      <SimplePagination page={Number(query.page || 1)} pageSize={PAGE_SIZE} totalItems={paginatedTotal(data)} hrefForPage={(page) => adminPageUrlBuilder.fragranceUgc.similaritySuggestions({ ...query, page })} />
    </main>
  );
}
