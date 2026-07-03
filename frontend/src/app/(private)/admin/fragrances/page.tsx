import Link from 'next/link';

import FragranceAdminTable from '@/app/components/fragrances/FragranceAdminTable';
import { fragranceAdminLabels as labels } from '@/app/components/fragrances/fragranceAdminLabels';
import { fragranceAdminStyles as styles } from '@/app/components/fragrances/fragranceAdmin.styles';
import { buildFragranceListQuery } from '@/app/selectors/fragranceSelectors';
import {
  getBrandsServer,
  getFragrancesServer,
} from '@/app/services/fragranceServices.server';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';

import type { Metadata } from 'next';
import type { PageSearchParams } from '@/app/utils/searchParamsUtils';

export const metadata: Metadata = {
  title: labels.fragrancesTitle,
};

type AdminFragrancesPageProps = {
  searchParams: Promise<PageSearchParams>;
};

const BRANDS_PAGE_SIZE = 1000;
const DEFAULT_PAGE_SIZE = 25;

type PaginationPayload = {
  count?: number;
  total_items?: number;
  total_pages?: number;
};

function readPositiveNumber(value: unknown, fallback: number) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function getTotalItems(page: PaginationPayload) {
  const totalItems = page.count ?? page.total_items ?? 0;

  return Number.isFinite(totalItems) && totalItems > 0 ? totalItems : 0;
}

function getTotalPages(page: PaginationPayload, pageSize: number) {
  if (Number.isFinite(page.total_pages) && page.total_pages && page.total_pages > 0) {
    return page.total_pages;
  }

  return Math.max(1, Math.ceil(getTotalItems(page) / pageSize));
}

export default async function AdminFragrancesPage({
  searchParams,
}: AdminFragrancesPageProps) {
  const params = await searchParams;
  const rawFilters = buildFragranceListQuery(params);
  const page = readPositiveNumber(rawFilters.page, 1);
  const pageSize = readPositiveNumber(rawFilters.page_size, DEFAULT_PAGE_SIZE);
  const filters = {
    ...rawFilters,
    page,
    page_size: pageSize,
  };

  const [fragrances, brands] = await Promise.all([
    getFragrancesServer(filters),
    getBrandsServer({ ordering: 'name', page_size: BRANDS_PAGE_SIZE }),
  ]);

  const totalPages = getTotalPages(fragrances, pageSize);

  return (
    <main className={styles.page}>
      <header className={styles.headerWithAction}>
        <div className={styles.header}>
          <h1 className={styles.title}>{labels.fragrancesTitle}</h1>
          <p className={styles.subtitle}>{labels.fragrancesSubtitle}</p>
        </div>

        <Link
          href={fragrancePageUrlBuilder.admin.createFragrance()}
          className={styles.primaryButton}
        >
          {labels.createFragrance}
        </Link>
      </header>

      <FragranceAdminTable
        fragrances={fragrances.results}
        brands={brands.results}
        query={typeof filters.q === 'string' ? filters.q : undefined}
        brandFilter={
          typeof filters.brand === 'string' || typeof filters.brand === 'number'
            ? filters.brand
            : undefined
        }
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
      />
    </main>
  );
}
