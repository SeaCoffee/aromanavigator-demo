import Link from 'next/link';

import { AppIcon } from '@/app/components/fragrances/AppLucideIcons';
import { fragrancePaginationStyles as styles } from '@/app/components/fragrances/fragranceEncyclopedia.styles';

type FragrancePaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages?: number;
  hrefForPage: (page: number) => string;
  hrefForPageSize?: (pageSize: number) => string;
  pageSizeOptions?: number[];
};

type PageItem = number | 'ellipsis';

function readPositiveNumber(value: unknown, fallback: number) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function getSafeTotalPages({
  totalItems,
  pageSize,
  totalPages,
}: {
  totalItems: number;
  pageSize: number;
  totalPages?: number;
}) {
  if (Number.isFinite(totalPages) && totalPages && totalPages > 0) {
    return Math.max(1, Math.floor(totalPages));
  }

  if (!totalItems || !pageSize) {
    return 1;
  }

  return Math.max(1, Math.ceil(totalItems / pageSize));
}

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, 'ellipsis', currentPage, 'ellipsis', totalPages];
}

export default function FragrancePagination({
  page,
  pageSize,
  totalItems,
  totalPages: totalPagesProp,
  hrefForPage,
  hrefForPageSize,
  pageSizeOptions = [12, 24, 48],
}: FragrancePaginationProps) {
  const safePageSize = readPositiveNumber(pageSize, 24);
  const safeTotalItems = readPositiveNumber(totalItems, 0);

  const totalPages = getSafeTotalPages({
    totalItems: safeTotalItems,
    pageSize: safePageSize,
    totalPages: totalPagesProp,
  });

  const currentPage = Math.min(readPositiveNumber(page, 1), totalPages);

  if (totalPages <= 1 && !hrefForPageSize) {
    return null;
  }

  const pageItems = getPageItems(currentPage, totalPages);
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <div className={styles.shell}>
      <nav className={styles.nav} aria-label="РџР°РіС–РЅР°С†С–СЏ Р°СЂРѕРјР°С‚С–РІ">
        {prevPage ? (
          <Link
            href={hrefForPage(prevPage)}
            className={styles.pageArrow}
            aria-label="РџРѕРїРµСЂРµРґРЅСЏ СЃС‚РѕСЂС–РЅРєР°"
          >
            <AppIcon name="chevronLeft" className="size-4" />
          </Link>
        ) : (
          <span className={styles.pageArrowDisabled} aria-hidden="true">
            <AppIcon name="chevronLeft" className="size-4" />
          </span>
        )}

        {pageItems.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={`ellipsis-${index}`}
              className={styles.ellipsis}
              aria-hidden="true"
            >
              ...
            </span>
          ) : item === currentPage ? (
            <span
              key={item}
              className={styles.pageLinkActive}
              aria-current="page"
            >
              {item}
            </span>
          ) : (
            <Link
              key={item}
              href={hrefForPage(item)}
              className={styles.pageLink}
            >
              {item}
            </Link>
          ),
        )}

        {nextPage ? (
          <Link
            href={hrefForPage(nextPage)}
            className={styles.pageArrow}
            aria-label="РќР°СЃС‚СѓРїРЅР° СЃС‚РѕСЂС–РЅРєР°"
          >
            <AppIcon name="chevronRight" className="size-4" />
          </Link>
        ) : (
          <span className={styles.pageArrowDisabled} aria-hidden="true">
            <AppIcon name="chevronRight" className="size-4" />
          </span>
        )}
      </nav>

      {hrefForPageSize ? (
        <div className={styles.sizeWrap}>
          <span>РџРѕРєР°Р·СѓРІР°С‚Рё:</span>

          <details className={styles.sizeMenu}>
            <summary className={styles.sizeSummary}>
              <span>{safePageSize}</span>
              <AppIcon name="chevronDown" className="size-4" />
            </summary>

            <div className={styles.sizeDropdown}>
              {pageSizeOptions.map((option) =>
                option === safePageSize ? (
                  <span key={option} className={styles.sizeOptionActive}>
                    {option}
                  </span>
                ) : (
                  <Link
                    key={option}
                    href={hrefForPageSize(option)}
                    className={styles.sizeOption}
                  >
                    {option}
                  </Link>
                ),
              )}
            </div>
          </details>
        </div>
      ) : null}
    </div>
  );
}
