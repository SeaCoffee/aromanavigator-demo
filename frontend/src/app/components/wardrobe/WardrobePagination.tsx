import Link from 'next/link';

import { wardrobeStyles as s } from '@/app/components/wardrobe/wardrobe.styles';
import type { WardrobeListQuery } from '@/app/types/wardrobeTypes';

type Props = {
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  query: WardrobeListQuery;
  buildHref: (query?: WardrobeListQuery) => string;
};

function queryWithPage(query: WardrobeListQuery, page: number): WardrobeListQuery {
  const nextQuery: WardrobeListQuery = {
    ...query,
    page,
  };

  if (page <= 1) {
    delete nextQuery.page;
  }

  return nextQuery;
}

export default function WardrobePagination({
  currentPage,
  hasNext,
  hasPrevious,
  query,
  buildHref,
}: Props) {
  if (!hasNext && !hasPrevious) {
    return null;
  }

  const previousPage = Math.max(currentPage - 1, 1);
  const nextPage = currentPage + 1;

  return (
    <nav className={s.pagination}>
      <span className={s.paginationMeta}>РЎС‚РѕСЂС–РЅРєР° {currentPage}</span>

      <div className={s.paginationActions}>
        {hasPrevious ? (
          <Link
            href={buildHref(queryWithPage(query, previousPage))}
            className={s.pageLink}
          >
            РќР°Р·Р°Рґ
          </Link>
        ) : null}

        {hasNext ? (
          <Link
            href={buildHref(queryWithPage(query, nextPage))}
            className={s.pageLink}
          >
            Р”Р°Р»С–
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
