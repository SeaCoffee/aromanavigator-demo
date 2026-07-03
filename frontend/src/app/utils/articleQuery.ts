import type { ArticleListQuery } from '@/app/types/articleTypes';
import { firstValue } from '@/app/utils/valueUtils';

export type PageSearchParams = Record<string, string | string[] | undefined>;

const ARTICLE_LIST_QUERY_KEYS = [
  'page',
  'q',
  'search',
  'status',
  'status_in',
  'tag',
  'tag_name',
  'tags',
  'tags_in',
  'author',
  'created_after',
  'created_before',
  'updated_after',
  'updated_before',
  'ordering',
] as const satisfies readonly (keyof ArticleListQuery)[];

export function toArticleListQuery(
  searchParams: PageSearchParams,
): ArticleListQuery {
  const query: ArticleListQuery = {};

  ARTICLE_LIST_QUERY_KEYS.forEach((key) => {
    const value = (firstValue(searchParams[key]) ?? '').trim();

    if (value) {
      query[key] = value;
    }
  });

  return query;
}

export function getArticlePage(query: ArticleListQuery) {
  const page = Number(query.page || 1);

  return Number.isInteger(page) && page > 0 ? page : 1;
}
