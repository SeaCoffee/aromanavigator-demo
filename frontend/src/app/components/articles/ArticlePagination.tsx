import Link from 'next/link';

import { articleStyles as styles } from '@/app/components/articles/article.styles';
import type { ArticleListQuery } from '@/app/types/articleTypes';

type Props = {
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  query: ArticleListQuery;
  buildHref: (query?: ArticleListQuery) => string;
};

function queryWithPage(query: ArticleListQuery, page: number): ArticleListQuery {
  const nextQuery: ArticleListQuery = {
    ...query,
    page,
  };

  if (page <= 1) {
    delete nextQuery.page;
  }

  return nextQuery;
}

export default function ArticlePagination({
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
    <nav className={styles.pagination}>
      <span className={styles.paginationText}>
        РЎС‚РѕСЂС–РЅРєР° {currentPage}
      </span>

      <div className={styles.paginationActions}>
        {hasPrevious ? (
          <Link
            href={buildHref(queryWithPage(query, previousPage))}
            className={styles.paginationLink}
          >
            РќР°Р·Р°Рґ
          </Link>
        ) : null}

        {hasNext ? (
          <Link
            href={buildHref(queryWithPage(query, nextPage))}
            className={styles.paginationLink}
          >
            Р”Р°Р»С–
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
