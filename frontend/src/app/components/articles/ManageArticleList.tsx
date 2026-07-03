'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import ArticleDeleteButton from '@/app/components/articles/ArticleDeleteButton';
import ArticleList from '@/app/components/articles/ArticleList';
import ArticleSubmitButton from '@/app/components/articles/ArticleSubmitButton';
import type { ArticleListItem } from '@/app/types/articleTypes';
import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';

type Props = {
  articles: ArticleListItem[];
  emptyText?: string;
};

export default function ManageArticleList({
  articles,
  emptyText = 'РЈ РІР°СЃ РїРѕРєРё РЅРµРјР°С” СЃС‚Р°С‚РµР№.',
}: Props) {
  const [visibleArticles, setVisibleArticles] = useState(articles);

  useEffect(() => {
    setVisibleArticles(articles);
  }, [articles]);

  function removeArticle(articleId: ArticleListItem['id']) {
    setVisibleArticles((current) => {
      return current.filter((article) => String(article.id) !== String(articleId));
    });
  }

  function markSubmitted(articleId: ArticleListItem['id']) {
    setVisibleArticles((current) => {
      return current.map((article) => {
        if (String(article.id) !== String(articleId)) {
          return article;
        }

        return {
          ...article,
          status: 'pending',
          status_label: 'РќР° РјРѕРґРµСЂР°С†С–С—',
        };
      });
    });
  }

  return (
    <ArticleList
      articles={visibleArticles}
      emptyText={emptyText}
      getHref={(article) => articlesPageUrlBuilder.me.edit(article.id)}
      getActions={(article) => (
        <>
          <Link
            href={articlesPageUrlBuilder.me.edit(article.id)}
            className={`${buttonStyles.compactSecondary}`}
          >
            Р РµРґР°РіСѓРІР°С‚Рё
          </Link>

          {article.status === 'draft' || article.status === 'rejected' ? (
            <ArticleSubmitButton
              articleId={article.id}
              onSubmitted={() => markSubmitted(article.id)}
            />
          ) : null}

          <ArticleDeleteButton
            articleId={article.id}
            onDeleted={() => removeArticle(article.id)}
          />
        </>
      )}
    />
  );
}
