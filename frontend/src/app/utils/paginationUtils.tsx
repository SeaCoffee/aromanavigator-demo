import { buttonStyles } from '@/app/components/common/buttonStyles';

// src/app/utils/paginationUtils.ts

import type { Paginated } from '@/app/types/http';
import { paginatedResults, paginatedTotal } from '@/app/utils/valueUtils';

import Link from 'next/link';

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
    <nav className="flex items-center justify-between gap-3 pt-4">
      <div className="text-sm text-neutral-500">
        РЎС‚РѕСЂС–РЅРєР° {page} Р· {totalPages}
      </div>

      <div className="flex gap-2">
        {prevPage ? (
          <Link
            href={hrefForPage(prevPage)}
            className={`${buttonStyles.secondary}`}
          >
            РќР°Р·Р°Рґ
          </Link>
        ) : (
          <span className="rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-300">
            РќР°Р·Р°Рґ
          </span>
        )}

        {nextPage ? (
          <Link
            href={hrefForPage(nextPage)}
            className={`${buttonStyles.secondary}`}
          >
            Р”Р°Р»С–
          </Link>
        ) : (
          <span className="rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-300">
            Р”Р°Р»С–
          </span>
        )}
      </div>
    </nav>
  );
}


export function getTotalPages(totalItems: number, pageSize: number) {
  if (pageSize <= 0) return 1;

  return Math.max(1, Math.ceil(totalItems / pageSize));
}


export function paginatedToArray<T>(data: Paginated<T> | T[]): T[] {
  return paginatedResults(data);
}

export function paginatedCount<T>(data: Paginated<T> | T[]): number {
  return paginatedTotal(data);
}
