import FavoriteList from '@/app/components/favorites/FavoriteList';
import { favoriteStyles } from '@/app/components/favorites/favoriteStyles';
import { requireUserOrRedirect } from '@/app/lib/session';
import { getMyFavoritesServer } from '@/app/services/favoriteServerServices';
import type { Query } from '@/app/types/http';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';
import SimplePagination from '@/app/utils/SimplePagination';
import { buildPageQuery, currentPageFromParams } from '@/app/utils/searchParamsUtils';

type SearchParams = Record<string, string | string[] | undefined>;

type Props = {
  searchParams?: Promise<SearchParams>;
};

function readParam(
  searchParams: SearchParams | undefined,
  key: string,
): string | undefined {
  const value = searchParams?.[key];

  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function getQuery(searchParams?: SearchParams): Query {
  return {
    page: readParam(searchParams, 'page'),
    app: readParam(searchParams, 'app'),
    model: readParam(searchParams, 'model'),
  };
}

export default async function MyFavoritesPage({ searchParams }: Props) {
  await requireUserOrRedirect();

  const resolvedSearchParams = await searchParams;
  const favoritesPage = await getMyFavoritesServer(
    getQuery(resolvedSearchParams),
  );
  const page = currentPageFromParams(resolvedSearchParams ?? {});

  return (
    <main className={favoriteStyles.page}>
      <header className={favoriteStyles.header}>
        <h1 className={favoriteStyles.title}>РћР±СЂР°РЅРµ</h1>
        <p className={favoriteStyles.subtitle}>
          Р—Р±РµСЂРµР¶РµРЅС– Р°СЂРѕРјР°С‚Рё, РѕРіРѕР»РѕС€РµРЅРЅСЏ, С‚РµРјРё С‚Р° С–РЅС€С– РѕР±КјС”РєС‚Рё.
        </p>
      </header>

      <FavoriteList favorites={favoritesPage.results} />
      <SimplePagination
        page={page}
        pageSize={20}
        totalItems={favoritesPage.total_items}
        hrefForPage={(nextPage) =>
          mePageUrlBuilder.favorites.list(
            buildPageQuery(resolvedSearchParams ?? {}, nextPage),
          )
        }
      />
    </main>
  );
}
