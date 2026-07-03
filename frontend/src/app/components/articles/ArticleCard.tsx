import Link from 'next/link';
import type { ReactNode } from 'react';

import { articleStyles as styles } from '@/app/components/articles/article.styles';
import MediaImage from '@/app/components/images/MediaImage';
import type { ArticleListItem } from '@/app/types/articleTypes';
import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';

type Props = {
  article: ArticleListItem;
  actions?: ReactNode;
  href?: string | null;
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function ArticleCard({
  article,
  actions,
  href = articlesPageUrlBuilder.public.detail(article.id),
}: Props) {
  const media = article.cover?.image ? (
    <MediaImage
      src={article.cover.image}
      alt={article.title}
      className={styles.cardMedia}
      fallbackClassName={styles.cardMediaFallback}
      fallback="Р‘РµР· РѕР±РєР»Р°РґРёРЅРєРё"
    />
  ) : null;

  return (
    <article className={styles.card}>
      {media && href ? (
        <Link href={href} className={styles.cardMediaLink}>
          {media}
        </Link>
      ) : media ? (
        <div className={styles.cardMediaLink}>{media}</div>
      ) : null}

      <div className={styles.cardTop}>
        <div className={styles.cardMeta}>
          <span className={styles.status}>
            {article.status_label}
          </span>

          <span>{formatDate(article.created_at)}</span>

          {article.author?.display_name ? (
            <span>РђРІС‚РѕСЂ: {article.author.display_name}</span>
          ) : null}
        </div>

        {href ? (
          <Link href={href} className={styles.cardLink}>
            {article.title}
          </Link>
        ) : (
          <h2 className={styles.cardLink}>
            {article.title}
          </h2>
        )}

        {article.excerpt ? (
          <p className={styles.excerpt}>
            {article.excerpt}
          </p>
        ) : null}
      </div>

      {article.tags.length ? (
        <div className={styles.tagList}>
          {article.tags.map((tag) => (
            <span key={tag.id} className={styles.tag}>
              #{tag.name}
            </span>
          ))}
        </div>
      ) : null}

      {actions ? (
        <div className={styles.actions}>
          {actions}
        </div>
      ) : null}
    </article>
  );
}
