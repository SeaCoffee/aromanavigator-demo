import type { Metadata } from 'next';
import Link from 'next/link';

import { buttonStyles } from '@/app/components/common/buttonStyles';
import { AppIcon } from '@/app/components/fragrances/AppLucideIcons';
import FragranceCard from '@/app/components/fragrances/FragranceCard';
import FragranceFilters from '@/app/components/fragrances/FragranceFilters';
import FragrancePagination from '@/app/components/fragrances/FragrancePagination';
import { fragranceEncyclopediaStyles as styles } from '@/app/components/fragrances/fragranceEncyclopedia.styles';
import FragranceAddRequestForm from '@/app/components/fragrances/ugc/FragranceAddRequestForm';
import { buildFragranceListQuery } from '@/app/selectors/fragranceSelectors';
import { getUserServer } from '@/app/lib/session';
import { getFragrancesServer } from '@/app/services/fragranceServices.server';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import type { PageSearchParams } from '@/app/utils/searchParamsUtils';
import { buildSeoMetadata } from '@/app/utils/seoMetadata';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Р”РѕРІС–РґРЅРёРє Р°СЂРѕРјР°С‚С–РІ',
  description:
    'РЁСѓРєР°Р№С‚Рµ Р°СЂРѕРјР°С‚Рё Р·Р° РЅР°Р·РІРѕСЋ, Р±СЂРµРЅРґРѕРј, СЂРѕРєРѕРј, РїР°СЂС„СѓРјРµСЂРѕРј, РЅРѕС‚Р°РјРё С‚Р° РѕР»СЊС„Р°РєС‚РѕСЂРЅРёРјРё СЃС–РјРµР№СЃС‚РІР°РјРё.',
  path: fragrancePageUrlBuilder.public.list(),
  keywords: [
    'РґРѕРІС–РґРЅРёРє Р°СЂРѕРјР°С‚С–РІ',
    'Р°СЂРѕРјР°С‚Рё Р·Р° РЅРѕС‚Р°РјРё',
    'РїР°СЂС„СѓРјРµСЂРЅС– Р±СЂРµРЅРґРё',
    'РїР°СЂС„СѓРјРµСЂРё',
    'РїР°СЂС„СѓРјРµСЂРЅР° РµРЅС†РёРєР»РѕРїРµРґС–СЏ',
  ],
});

type FragrancesPageProps = {
  searchParams: Promise<PageSearchParams>;
};

const DEFAULT_PAGE_SIZE = 24;
const FRAGRANCE_FILTER_KEYS = [
  'fragrance_id',
  'name',
  'brand',
  'note',
  'note_level',
  'family',
  'perfumer',
  'year_from',
  'year_to',
  'q',
] as const;

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

function getTotalPages(page: PaginationPayload) {
  return Number.isFinite(page.total_pages) &&
    page.total_pages &&
    page.total_pages > 0
    ? page.total_pages
    : undefined;
}

function hasActiveFilterParams(
  params: Record<string, unknown>,
  keys: readonly string[],
) {
  return keys.some((key) => {
    const value = params[key];

    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && String(value).trim() !== '';
  });
}

export default async function FragrancesPage({
  searchParams,
}: FragrancesPageProps) {
  const params = await searchParams;
  const rawFilters = buildFragranceListQuery(params);
  const page = readPositiveNumber(rawFilters.page, 1);
  const pageSize = readPositiveNumber(rawFilters.page_size, DEFAULT_PAGE_SIZE);

  const filters = {
    ...rawFilters,
    page,
    page_size: pageSize,
  };

  const [fragrances, user] = await Promise.all([
    getFragrancesServer(filters),
    getUserServer(),
  ]);
  const totalItems = getTotalItems(fragrances);
  const hasActiveFilters = hasActiveFilterParams(filters, FRAGRANCE_FILTER_KEYS);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.intro}>
          <header className={styles.header}>
            <h1 className={styles.title}>Р”РѕРІС–РґРЅРёРє Р°СЂРѕРјР°С‚С–РІ</h1>

            <p className={styles.lead}>
              РЁСѓРєР°Р№С‚Рµ Р·Р° РЅР°Р·РІРѕСЋ, Р±СЂРµРЅРґРѕРј, СЂРѕРєРѕРј С– РїР°СЂС„СѓРјРµСЂРѕРј Р°Р±Рѕ РїРѕС”РґРЅСѓР№С‚Рµ
              СЃС–РјРµР№СЃС‚РІР° С‚Р° РЅРѕС‚Рё, С‰РѕР± Р·РЅР°Р№С‚Рё РїРѕС‚СЂС–Р±РЅРёР№ РѕР»СЊС„Р°РєС‚РѕСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ.
            </p>
          </header>

          <details className={styles.addRequestDetails}>
            <summary className={styles.addRequestSummary}>
              <span className={styles.addRequestSummaryIcon} aria-hidden="true">
                <AppIcon name="spray" className="size-6" />
              </span>

              <span className={styles.addRequestSummaryText}>
                Р”РѕРґР°С‚Рё Р°СЂРѕРјР°С‚, СЏРєРѕРіРѕ Р±СЂР°РєСѓС”
              </span>

              <AppIcon
                name="chevronRight"
                className={styles.addRequestSummaryChevron}
              />
            </summary>

            <div className={styles.addRequestBody}>
              {user ? (
                <FragranceAddRequestForm />
              ) : (
                <div className="grid gap-3">
                  <p className="text-sm text-neutral-600">
                    РЈРІС–Р№РґС–С‚СЊ РІ Р°РєР°СѓРЅС‚, С‰РѕР± РЅР°РґС–СЃР»Р°С‚Рё Р·Р°СЏРІРєСѓ С‚Р° СЃС‚РµР¶РёС‚Рё Р·Р° С—С—
                    СЃС‚Р°С‚СѓСЃРѕРј.
                  </p>
                  <Link
                    href={authPageUrlBuilder.login({
                      next: fragrancePageUrlBuilder.public.list(),
                    })}
                    className={`${buttonStyles.primary} w-fit`}
                  >
                    РЈРІС–Р№С‚Рё
                  </Link>
                </div>
              )}
            </div>
          </details>
        </section>

        <section className={styles.catalogLayout}>
          <aside className={styles.sidebar}>
            <FragranceFilters filters={filters} />
          </aside>

          <section className={styles.resultsPanel}>
            <header className={styles.resultsToolbar}>
              <div>
                <h2 className={styles.resultsTitle}>РљР°С‚Р°Р»РѕРі Р°СЂРѕРјР°С‚С–РІ</h2>
                <p className={styles.resultsMeta}>
                  {totalItems
                    ? `Р—РЅР°Р№РґРµРЅРѕ Р°СЂРѕРјР°С‚С–РІ: ${totalItems}`
                    : 'РЎРїСЂРѕР±СѓР№С‚Рµ Р·РјС–РЅРёС‚Рё С„С–Р»СЊС‚СЂРё Р°Р±Рѕ РїРѕС€СѓРєРѕРІРёР№ Р·Р°РїРёС‚.'}
                </p>
              </div>
            </header>

            {fragrances.results.length === 0 ? (
              <section className={styles.empty}>
                {hasActiveFilters
                  ? 'Р—Р° РІРёР±СЂР°РЅРёРјРё С„С–Р»СЊС‚СЂР°РјРё РЅС–С‡РѕРіРѕ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.'
                  : 'РЈ РґРѕРІС–РґРЅРёРєСѓ РїРѕРєРё РЅРµРјР°С” Р°СЂРѕРјР°С‚С–РІ.'}
              </section>
            ) : (
              <section className={styles.grid}>
                {fragrances.results.map((fragrance) => (
                  <FragranceCard key={fragrance.id} fragrance={fragrance} />
                ))}
              </section>
            )}

            <FragrancePagination
              page={page}
              pageSize={pageSize}
              totalItems={totalItems}
              totalPages={getTotalPages(fragrances)}
              hrefForPage={(nextPage: number) =>
                fragrancePageUrlBuilder.public.list({
                  ...filters,
                  page: nextPage,
                })
              }
              hrefForPageSize={(nextPageSize: number) =>
                fragrancePageUrlBuilder.public.list({
                  ...filters,
                  page: 1,
                  page_size: nextPageSize,
                })
              }
            />
          </section>
        </section>
      </div>
    </main>
  );
}
