import type { Metadata } from 'next';

import AdminArticleModerationList from '@/app/components/articles/AdminArticleModerationList';
import ArticleListToolbar from '@/app/components/articles/ArticleListToolbar';
import ArticlePagination from '@/app/components/articles/ArticlePagination';
import { requireAdminOrRedirect } from '@/app/lib/session';
import { getAdminArticleModerationServer } from '@/app/services/articleServices.server';
import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';
import type { PageSearchParams } from '@/app/utils/articleQuery';
import {
  getArticlePage,
  toArticleListQuery,
} from '@/app/utils/articleQuery';

export const metadata: Metadata = {
  title: 'РњРѕРґРµСЂР°С†С–СЏ СЃС‚Р°С‚РµР№',
};

type Props = {
  searchParams?: Promise<PageSearchParams>;
};

export default async function AdminArticleModerationPage({
  searchParams,
}: Props) {
  await requireAdminOrRedirect();

  const resolvedSearchParams = await searchParams;
  const query = toArticleListQuery(resolvedSearchParams ?? {});
  const articles = await getAdminArticleModerationServer(query);
  const currentPage = getArticlePage(query);

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6">
      <header>
        <h1 className="text-2xl font-semibold text-gray-950">
          РњРѕРґРµСЂР°С†С–СЏ СЃС‚Р°С‚РµР№
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          РџРµСЂРµРІС–СЂРєР°, РїСѓР±Р»С–РєР°С†С–СЏ С‚Р° РІС–РґС…РёР»РµРЅРЅСЏ РјР°С‚РµСЂС–Р°Р»С–РІ РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ.
        </p>
      </header>

      <ArticleListToolbar
        action={articlesPageUrlBuilder.admin.moderation()}
        query={query}
        showStatusFilter
      />

      <AdminArticleModerationList articles={articles.results} />

      <ArticlePagination
        currentPage={currentPage}
        hasNext={Boolean(articles.next)}
        hasPrevious={Boolean(articles.previous)}
        query={query}
        buildHref={articlesPageUrlBuilder.admin.moderation}
      />
    </main>
  );
}
