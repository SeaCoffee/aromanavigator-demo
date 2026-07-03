import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ArticleList from '@/app/components/articles/ArticleList';
import ArticlePagination from '@/app/components/articles/ArticlePagination';
import { getPublicArticlesServer } from '@/app/services/articleServices.server';
import { getPublicUserByUsernameServer } from '@/app/services/userServices.server';
import type { PageSearchParams } from '@/app/utils/articleQuery';
import {
  getArticlePage,
  toArticleListQuery,
} from '@/app/utils/articleQuery';
import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import { getPublicUserDisplayName } from '@/app/utils/userDisplayUtils';
import { ApiError } from '@/errors/ApiError';

type Props = {
  params: Promise<{
    username: string;
  }>;
  searchParams?: Promise<PageSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `РЎС‚Р°С‚С‚С– ${username}`,
  };
}

function isNotFoundError(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

export default async function PublicUserArticlesPage({
  params,
  searchParams,
}: Props) {
  const { username } = await params;
  const resolvedSearchParams = await searchParams;

  try {
    const publicUser = await getPublicUserByUsernameServer(username);
    const displayName = getPublicUserDisplayName(publicUser);
    const query = {
      ...toArticleListQuery(resolvedSearchParams ?? {}),
      author: publicUser.id,
      status: 'published',
    };
    const articles = await getPublicArticlesServer(query);
    const currentPage = getArticlePage(query);

    return (
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-950">
            РЎС‚Р°С‚С‚С– {displayName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            РћРїСѓР±Р»С–РєРѕРІР°РЅС– РјР°С‚РµСЂС–Р°Р»Рё РєРѕСЂРёСЃС‚СѓРІР°С‡Р°.
          </p>
        </header>

        <ArticleList
          articles={articles.results}
          emptyText="РЈ РєРѕСЂРёСЃС‚СѓРІР°С‡Р° РїРѕРєРё РЅРµРјР°С” РѕРїСѓР±Р»С–РєРѕРІР°РЅРёС… СЃС‚Р°С‚РµР№."
          getHref={(article) => articlesPageUrlBuilder.public.detail(article.id)}
        />

        <ArticlePagination
          currentPage={currentPage}
          hasNext={Boolean(articles.next)}
          hasPrevious={Boolean(articles.previous)}
          query={query}
          buildHref={(nextQuery) => userPageUrlBuilder.articles(username, nextQuery)}
        />
      </main>
    );
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }

    throw error;
  }
}
