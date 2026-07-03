import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { articleStyles as styles } from '@/app/components/articles/article.styles';
import ArticleContent from '@/app/components/articles/ArticleContent';
import ArticleCommentsSection from '@/app/components/articles/ArticleCommentsSection';
import MediaImage from '@/app/components/images/MediaImage';
import ObjectPhotoGallery from '@/app/components/photos/ObjectPhotoGallery';
import ShareButton from '@/app/components/share/ShareButton';
import { siteUrl } from '@/app/constants/siteConstants';
import { getPublicArticleServer } from '@/app/services/articleServices.server';
import { getCommentThreadByTargetServer } from '@/app/services/commentServerServices';
import { getUserServer } from '@/app/lib/session';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import type { ForumCommentThreadItem, Paginated } from '@/app/types/forumTypes';
import type { ID } from '@/app/types/userTypes';
import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';
import { buildSeoMetadata, truncateSeoText } from '@/app/utils/seoMetadata';
import {
  stripArticlePhotoTokens,
  unusedArticlePhotos,
} from '@/app/utils/articleContentUtils';
import { paginatedResults, paginatedTotal } from '@/app/utils/valueUtils';

type Props = {
  params: Promise<{
    articleId: string;
  }>;
  searchParams?: Promise<{
    comments_page?: string | string[];
  }>;
};

function normalizeArticleId(value: string): number {
  const articleId = Number(value);

  if (!Number.isInteger(articleId) || articleId <= 0) {
    notFound();
  }

  return articleId;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { articleId: rawArticleId } = await params;
  const articleId = normalizeArticleId(rawArticleId);
  const article = await getPublicArticleServer(articleId).catch(() => null);

  if (!article) {
    return buildSeoMetadata({
      title: 'РЎС‚Р°С‚С‚СЋ РЅРµ Р·РЅР°Р№РґРµРЅРѕ',
      description: 'РџСѓР±Р»С–РєР°С†С–СЋ РЅРµ Р·РЅР°Р№РґРµРЅРѕ Р°Р±Рѕ РІРѕРЅР° РЅРµРґРѕСЃС‚СѓРїРЅР°.',
      path: articlesPageUrlBuilder.public.detail(articleId),
      noIndex: true,
    });
  }

  return buildSeoMetadata({
    title: article.title,
    description: truncateSeoText(stripArticlePhotoTokens(article.content)),
    path: articlesPageUrlBuilder.public.detail(articleId),
    type: 'article',
    publishedTime: article.created_at,
    modifiedTime: article.updated_at,
    keywords: [
      article.title,
      ...article.tags.map((tag) => tag.name),
      'СЃС‚Р°С‚С‚С– РїСЂРѕ Р°СЂРѕРјР°С‚Рё',
      'РїР°СЂС„СѓРјРµСЂРЅР° СЃРїС–Р»СЊРЅРѕС‚Р°',
    ],
  });
}

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

export default async function PublicArticleDetailPage({
  params,
  searchParams,
}: Props) {
  const { articleId: rawArticleId } = await params;
  const articleId = normalizeArticleId(rawArticleId);
  const article = await getPublicArticleServer(articleId).catch(() => null);

  if (!article) {
    notFound();
  }

  const articlePath = articlesPageUrlBuilder.public.detail(articleId);
  const galleryPhotos = unusedArticlePhotos(article.content, article.attachments);
  const rawCommentsPage = (await searchParams)?.comments_page;
  const commentsPage = Math.max(
    1,
    Number(Array.isArray(rawCommentsPage) ? rawCommentsPage[0] : rawCommentsPage) || 1,
  );
  const [commentsData, user] = await Promise.all([
    getCommentThreadByTargetServer({
      app: 'articles',
      model: 'article',
      id: articleId,
      page: commentsPage,
      page_size: 20,
    }).catch(() => ({ results: [], total_items: 0, prev: false, next: false })),
    getUserServer(),
  ]);
  const comments = paginatedResults<ForumCommentThreadItem>(commentsData);
  const commentsMeta = Array.isArray(commentsData)
    ? null
    : commentsData as Paginated<ForumCommentThreadItem>;

  return (
    <main className={styles.page}>
      <div className={styles.detailContainer}>
        <Link
          href={articlesPageUrlBuilder.public.list()}
          className={styles.backLink}
        >
          в†ђ Р”Рѕ СЃС‚Р°С‚РµР№
        </Link>

        <article className={styles.article}>
          <header className={styles.articleHeader}>
            <div className={styles.detailActions}>
              <div className={styles.meta}>
                <span>{formatDate(article.created_at)}</span>

                {article.author?.display_name ? (
                  <span>РђРІС‚РѕСЂ: {article.author.display_name}</span>
                ) : null}
              </div>

              <ShareButton
                url={siteUrl(articlePath)}
                title={article.title}
                text="РЎС‚Р°С‚С‚СЏ Сѓ РїР°СЂС„СѓРјРµСЂРЅС–Р№ СЃРїС–Р»СЊРЅРѕС‚С– AromaNavigator."
              />
            </div>

            <h1 className={styles.title}>{article.title}</h1>

            {article.tags.length ? (
              <div className={styles.tagList}>
                {article.tags.map((tag) => (
                  <span key={tag.id} className={styles.tag}>
                    #{tag.name}
                  </span>
                ))}
              </div>
            ) : null}
          </header>

          {article.cover?.image ? (
            <div className={styles.coverFrame}>
              <MediaImage
                src={article.cover.image}
                alt={article.title}
                className={styles.coverImage}
                fallbackClassName={styles.coverFallback}
                fallback="РћР±РєР»Р°РґРёРЅРєР° РЅРµРґРѕСЃС‚СѓРїРЅР°"
              />
            </div>
          ) : null}

          <ArticleContent
            content={article.content}
            photos={article.attachments}
          />
        </article>

        {galleryPhotos.length ? (
          <ObjectPhotoGallery
            title="Р¤РѕС‚РѕРіСЂР°С„С–С— РґРѕ СЃС‚Р°С‚С‚С–"
            photos={galleryPhotos}
          />
        ) : null}

        <ArticleCommentsSection
          articleId={articleId}
          refreshPath={articlePath}
          comments={comments}
          count={paginatedTotal(commentsData)}
          page={commentsPage}
          hasNext={Boolean(commentsMeta?.next)}
          hasPrevious={Boolean(commentsMeta?.prev)}
          loginHref={
            user
              ? undefined
              : authPageUrlBuilder.login({ next: `${articlePath}#comments` })
          }
        />
      </div>
    </main>
  );
}
