'use client';

import { useEffect, useState } from 'react';

import AdminArticleModerationActions from '@/app/components/articles/AdminArticleModerationActions';
import ArticleList from '@/app/components/articles/ArticleList';
import type { ArticleListItem } from '@/app/types/articleTypes';
import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';

type Props = {
  articles: ArticleListItem[];
};

export default function AdminArticleModerationList({
  articles,
}: Props) {
  const [visibleArticles, setVisibleArticles] = useState(articles);

  useEffect(() => {
    setVisibleArticles(articles);
  }, [articles]);

  function removeFromQueue(articleId: ArticleListItem['id']) {
    setVisibleArticles((current) => {
      return current.filter((article) => String(article.id) !== String(articleId));
    });
  }

  return (
    <ArticleList
      articles={visibleArticles}
      emptyText="РќРµРјР°С” СЃС‚Р°С‚РµР№ РґР»СЏ РјРѕРґРµСЂР°С†С–С—."
      getHref={(article) => articlesPageUrlBuilder.public.detail(article.id)}
      getActions={(article) => (
        <AdminArticleModerationActions
          articleId={article.id}
          onChanged={() => removeFromQueue(article.id)}
        />
      )}
    />
  );
}
