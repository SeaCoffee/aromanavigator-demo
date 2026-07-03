import type { ReactNode } from 'react';

import ArticleCard from '@/app/components/articles/ArticleCard';
import { articleStyles as styles } from '@/app/components/articles/article.styles';
import type { ArticleListItem } from '@/app/types/articleTypes';

type Props = {
  articles: ArticleListItem[];
  emptyText?: string;
  getActions?: (article: ArticleListItem) => ReactNode;
  getHref?: (article: ArticleListItem) => string | null;
};

export default function ArticleList({
  articles,
  emptyText = 'РЎС‚Р°С‚РµР№ РїРѕРєРё РЅРµРјР°С”.',
  getActions,
  getHref,
}: Props) {
  if (!articles.length) {
    return <div className={styles.empty}>{emptyText}</div>;
  }

  return (
    <div className={styles.list}>
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          actions={getActions?.(article)}
          href={getHref?.(article)}
        />
      ))}
    </div>
  );
}
