import type { Metadata } from 'next';
import Link from 'next/link';

import ArticleListToolbar from '@/app/components/articles/ArticleListToolbar';
import ArticlePagination from '@/app/components/articles/ArticlePagination';
import ManageArticleList from '@/app/components/articles/ManageArticleList';
import { buttonStyles } from '@/app/components/common/buttonStyles';
import { requireUserOrRedirect } from '@/app/lib/session';
import { getMyArticlesServer } from '@/app/services/articleServices.server';
import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';
import type { PageSearchParams } from '@/app/utils/articleQuery';
import {
  getArticlePage,
  toArticleListQuery,
} from '@/app/utils/articleQuery';

export const metadata: Metadata = {
  title: 'РњРѕС— СЃС‚Р°С‚С‚С–',
};

type Props = {
  searchParams?: Promise<PageSearchParams>;
};

export default async function MyArticlesPage({
  searchParams,
}: Props) {
  await requireUserOrRedirect();

  const resolvedSearchParams = await searchParams;
  const query = toArticleListQuery(resolvedSearchParams ?? {});
  const articles = await getMyArticlesServer(query);
  const currentPage = getArticlePage(query);

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">
            РњРѕС— СЃС‚Р°С‚С‚С–
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Р§РµСЂРЅРµС‚РєРё, СЃС‚Р°С‚С‚С– РЅР° РјРѕРґРµСЂР°С†С–С— С‚Р° РѕРїСѓР±Р»С–РєРѕРІР°РЅС– РјР°С‚РµСЂС–Р°Р»Рё.
          </p>
        </div>

        <Link
          href={articlesPageUrlBuilder.me.create()}
          className={buttonStyles.primary}
        >
          РќР°РїРёСЃР°С‚Рё СЃС‚Р°С‚С‚СЋ
        </Link>
      </div>

      <ArticleListToolbar
        action={articlesPageUrlBuilder.me.list()}
        query={query}
        showStatusFilter
      />

      <ManageArticleList
        articles={articles.results}
        emptyText="РЈ РІР°СЃ РїРѕРєРё РЅРµРјР°С” СЃС‚Р°С‚РµР№."
      />

      <ArticlePagination
        currentPage={currentPage}
        hasNext={Boolean(articles.next)}
        hasPrevious={Boolean(articles.previous)}
        query={query}
        buildHref={articlesPageUrlBuilder.me.list}
      />
    </main>
  );
}
