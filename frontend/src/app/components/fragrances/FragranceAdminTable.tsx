import { buttonStyles } from '@/app/components/common/buttonStyles';

import Form from 'next/form';
import Link from 'next/link';

import { fragranceAdminLabels as labels } from '@/app/components/fragrances/fragranceAdminLabels';
import { fragranceAdminStyles as styles } from '@/app/components/fragrances/fragranceAdmin.styles';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';

import type { Brand, FragranceListItem } from '@/app/types/fragranceTypes';
import type { ID } from '@/app/types/http';

type FragranceAdminTableProps = {
  fragrances: FragranceListItem[];
  brands: Brand[];
  query?: string;
  brandFilter?: ID;
  page: number;
  pageSize: number;
  totalPages: number;
};

function adminFragrancesHref(params: {
  q?: string;
  brand?: ID;
  page?: number;
  pageSize: number;
}) {
  return fragrancePageUrlBuilder.admin.fragrances({
    q: params.q || undefined,
    brand: params.brand,
    page: params.page && params.page > 1 ? params.page : undefined,
    page_size: params.pageSize,
  });
}

export default function FragranceAdminTable({
  fragrances,
  brands,
  query,
  brandFilter,
  page,
  pageSize,
  totalPages,
}: FragranceAdminTableProps) {
  const listHref = fragrancePageUrlBuilder.admin.fragrances();

  return (
    <section className={styles.section}>
      <Form action={listHref} replace className={styles.formRow}>
        <input type="hidden" name="page" value="1" />
        <input type="hidden" name="page_size" value={String(pageSize)} />

        <label className={styles.field}>
          <span className={styles.label}>{labels.search}</span>
          <input
            name="q"
            defaultValue={query ?? ''}
            placeholder={labels.searchPlaceholder}
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>{labels.brand}</span>
          <select
            name="brand"
            defaultValue={brandFilter ? String(brandFilter) : ''}
            className={styles.input}
          >
            <option value="">{labels.allBrands}</option>
            {brands.map((brand) => (
              <option key={brand.id} value={String(brand.id)}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className={styles.button}
        >
          {labels.filter}
        </button>

        <Link
          href={listHref}
          className={styles.button}
        >
          {labels.reset}
        </Link>
      </Form>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableCell}>ID</th>
              <th className={styles.tableCell}>{labels.brand}</th>
              <th className={styles.tableCell}>{labels.name}</th>
              <th className={styles.tableCell}>{labels.year}</th>
              <th className={styles.tableCell}>
                <span className="sr-only">{labels.actions}</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {fragrances.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyCell}>
                  {labels.nothingFound}
                </td>
              </tr>
            ) : (
              fragrances.map((fragrance) => (
                <tr
                  key={fragrance.id}
                  className={styles.tableRow}
                >
                  <td className={styles.tableCell}>{fragrance.id}</td>
                  <td className={styles.tableCell}>{fragrance.brand.name}</td>
                  <td className={styles.tableCell}>{fragrance.name}</td>
                  <td className={styles.tableCell}>{fragrance.release_year ?? '-'}</td>
                  <td className={`${styles.tableCell} text-right`}>
                    <Link
                      href={fragrancePageUrlBuilder.admin.editFragrance(fragrance.id)}
                      className={styles.smallLinkButton}
                    >
                      {labels.edit}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={adminFragrancesHref({
              q: query,
              brand: brandFilter,
              page: page - 1,
              pageSize,
            })}
            className={`${buttonStyles.compactSecondary}`}
          >
            {labels.previous}
          </Link>
        ) : (
          <span className="rounded-lg border border-neutral-300 px-3 py-1 opacity-40">
            {labels.previous}
          </span>
        )}

        <div className={styles.muted}>{labels.pageOf(page, totalPages)}</div>

        {page < totalPages ? (
          <Link
            href={adminFragrancesHref({
              q: query,
              brand: brandFilter,
              page: page + 1,
              pageSize,
            })}
            className={`${buttonStyles.compactSecondary}`}
          >
            {labels.next}
          </Link>
        ) : (
          <span className="rounded-lg border border-neutral-300 px-3 py-1 opacity-40">
            {labels.next}
          </span>
        )}
      </div>
    </section>
  );
}
