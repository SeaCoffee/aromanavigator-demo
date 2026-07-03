import Link from 'next/link';

import { paginationStyles as styles } from '@/app/components/common/pagination.styles';

type SimplePaginationProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  hrefForPage: (page: number) => string;
};

export default function SimplePagination({
  page,
  pageSize,
  totalItems,
  hrefForPage,
}: SimplePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalPages <= 1) return null;

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <nav className={styles.root}>
      <div className={styles.text}>
        РЎС‚РѕСЂС–РЅРєР° {page} Р· {totalPages}
      </div>

      <div className={styles.actions}>
        {prevPage ? (
          <Link
            href={hrefForPage(prevPage)}
            className={styles.link}
          >
            РќР°Р·Р°Рґ
          </Link>
        ) : (
          <span className={styles.disabled}>
            РќР°Р·Р°Рґ
          </span>
        )}

        {nextPage ? (
          <Link
            href={hrefForPage(nextPage)}
            className={styles.link}
          >
            Р”Р°Р»С–
          </Link>
        ) : (
          <span className={styles.disabled}>
            Р”Р°Р»С–
          </span>
        )}
      </div>
    </nav>
  );
}
