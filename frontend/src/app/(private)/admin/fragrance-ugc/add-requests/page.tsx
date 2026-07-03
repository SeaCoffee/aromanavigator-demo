import FragranceAddRequestsAdminTable from '@/app/components/fragrances/ugc/FragranceAddRequestsAdminTable';
import { fragranceAdminLabels as labels } from '@/app/components/fragrances/fragranceAdminLabels';
import { fragranceAdminStyles as styles } from '@/app/components/fragrances/fragranceAdmin.styles';
import { buildAddRequestQuery } from '@/app/selectors/fragranceUgcSelectors';
import { getAdminFragranceAddRequestsServer } from '@/app/services/fragranceUgcService.server';

import type { PageSearchParams } from '@/app/utils/searchParamsUtils';
import SimplePagination from '@/app/utils/SimplePagination';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';
import { paginatedTotal } from '@/app/utils/valueUtils';

const PAGE_SIZE = 25;

type AdminAddRequestsPageProps = {
  searchParams: Promise<PageSearchParams>;
};

export default async function AdminAddRequestsPage({
  searchParams,
}: AdminAddRequestsPageProps) {
  const query = buildAddRequestQuery(await searchParams);
  const data = await getAdminFragranceAddRequestsServer({
    ...query,
    status: query.status ?? 'pending',
    page_size: PAGE_SIZE,
  });

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8">
      <header className={styles.header}>
        <h1 className={styles.title}>{labels.addRequests}</h1>
        <p className={styles.subtitle}>{labels.addRequestsDescription}</p>
      </header>

      <FragranceAddRequestsAdminTable items={data.results} />
      <SimplePagination page={Number(query.page || 1)} pageSize={PAGE_SIZE} totalItems={paginatedTotal(data)} hrefForPage={(page) => adminPageUrlBuilder.fragranceUgc.addRequests({ ...query, page })} />
    </main>
  );
}
