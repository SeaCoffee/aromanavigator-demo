import type { Metadata } from 'next';

import ArticleList from '@/app/components/articles/ArticleList';
import ArticleListToolbar from '@/app/components/articles/ArticleListToolbar';
import ArticlePagination from '@/app/components/articles/ArticlePagination';
import { articleStyles as styles } from '@/app/components/articles/article.styles';
import { getPublicArticlesServer } from '@/app/services/articleServices.server';
import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';
import type { PageSearchParams } from '@/app/utils/articleQuery';
import {
  getArticlePage,
  toArticleListQuery,
} from '@/app/utils/articleQuery';
import { buildSeoMetadata } from '@/app/utils/seoMetadata';

export const metadata: Metadata = buildSeoMetadata({
  title: 'РЎС‚Р°С‚С‚С– РїСЂРѕ Р°СЂРѕРјР°С‚Рё',
  description:
    'РџСѓР±Р»С–РєР°С†С–С— РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ, РѕРіР»СЏРґРё, РЅРѕС‚Р°С‚РєРё, РґРѕР±С–СЂРєРё С‚Р° РјР°С‚РµСЂС–Р°Р»Рё РїСЂРѕ Р°СЂРѕРјР°С‚Рё С– РїР°СЂС„СѓРјРµСЂРЅСѓ РєСѓР»СЊС‚СѓСЂСѓ.',
  path: articlesPageUrlBuilder.public.list(),
  keywords: [
    'СЃС‚Р°С‚С‚С– РїСЂРѕ Р°СЂРѕРјР°С‚Рё',
    'РѕРіР»СЏРґРё РїР°СЂС„СѓРјС–РІ',
    'РїР°СЂС„СѓРјРµСЂРЅС– РЅРѕС‚Р°С‚РєРё',
    'Р°СЂРѕРјР°С‚РёС‡РЅС– РґРѕР±С–СЂРєРё',
  ],
});

type Props = {
  searchParams?: Promise<PageSearchParams>;
};

export default async function PublicArticlesPage({
  searchParams,
}: Props) {
  const resolvedSearchParams = await searchParams;
  const query = toArticleListQuery(resolvedSearchParams ?? {});
  const articles = await getPublicArticlesServer(query);
  const currentPage = getArticlePage(query);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>РЎС‚Р°С‚С‚С–</h1>

          <p className={styles.lead}>
            РџСѓР±Р»С–РєР°С†С–С— РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ, РѕРіР»СЏРґРё, РЅРѕС‚Р°С‚РєРё С‚Р° РјР°С‚РµСЂС–Р°Р»Рё РїСЂРѕ Р°СЂРѕРјР°С‚Рё.
          </p>
        </header>

        <ArticleListToolbar
          action={articlesPageUrlBuilder.public.list()}
          query={query}
        />

        <ArticleList
          articles={articles.results}
          emptyText="РћРїСѓР±Р»С–РєРѕРІР°РЅРёС… СЃС‚Р°С‚РµР№ РїРѕРєРё РЅРµРјР°С”."
        />

        <ArticlePagination
          currentPage={currentPage}
          hasNext={Boolean(articles.next)}
          hasPrevious={Boolean(articles.previous)}
          query={query}
          buildHref={articlesPageUrlBuilder.public.list}
        />
      </div>
    </main>
  );
}
