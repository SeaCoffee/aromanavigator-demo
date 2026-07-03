import FragranceCommentForm from '@/app/components/fragrances/comments/FragranceCommentForm';
import { fragranceDetailStyles as styles } from '@/app/components/fragrances/fragranceEncyclopedia.styles';
import MediaImage from '@/app/components/images/MediaImage';
import type { ForumCommentThreadItem, Paginated } from '@/app/types/forumTypes';
import { commentAnchorUrlBuilder } from '@/app/urls/pageUrls/commentAnchorUrlBuilder';

type FragranceCommentsSectionProps = {
  fragranceId: number;
  refreshPath: string;
  comments: ForumCommentThreadItem[];
  pagination?: Pick<Paginated<ForumCommentThreadItem>, 'count' | 'next' | 'prev'>;
  loginHref?: string;
};

function formatCommentDate(value: string): string {
  return new Date(value).toLocaleString('uk-UA', {
    timeZone: 'Europe/Kyiv',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCommentAuthor(item: ForumCommentThreadItem): string {
  return (
    item.user_display_name ||
    item.user_username ||
    'РљРѕСЂРёСЃС‚СѓРІР°С‡'
  );
}

function CommentNode({
  item,
  depth = 0,
}: {
  item: ForumCommentThreadItem;
  depth?: number;
}) {
  return (
    <div className="grid gap-3">
      <article
        id={commentAnchorUrlBuilder.domId(item.id)}
        className={`${styles.commentCard} scroll-mt-24`}
      >
        <div className={styles.commentMeta}>
          <span className={styles.commentAuthor}>{getCommentAuthor(item)}</span>
          <span>{formatCommentDate(item.created_at)}</span>
          {item.updated_at !== item.created_at && !item.is_deleted ? (
            <span>СЂРµРґ. {formatCommentDate(item.updated_at)}</span>
          ) : null}
        </div>

        {item.is_deleted ? (
          <p className={styles.commentDeleted}>РљРѕРјРµРЅС‚Р°СЂ РІРёРґР°Р»РµРЅРѕ.</p>
        ) : (
          <p className={styles.commentBody}>{item.body}</p>
        )}

        {!item.is_deleted && item.attachments?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {item.attachments.map((photo) => (
              <MediaImage
                key={photo.id}
                src={photo.image}
                alt="Р¤РѕС‚Рѕ РґРѕ РІС–РґРіСѓРєСѓ"
                className="h-24 w-24 rounded-xl object-cover"
                fallbackClassName="h-24 w-24 rounded-xl bg-gray-100"
                fallback=""
              />
            ))}
          </div>
        ) : null}
      </article>

      {item.replies?.length ? (
        <div className={depth >= 2 ? 'grid gap-3' : styles.commentReplies}>
          {item.replies.map((reply) => (
            <CommentNode key={reply.id} item={reply} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function FragranceCommentsSection({
  fragranceId,
  refreshPath,
  comments,
  pagination,
  loginHref,
}: FragranceCommentsSectionProps) {
  return (
    <section id="comments" className={styles.commentsSection}>
      <header className={styles.commentsHeader}>
        <h2 className={styles.commentsTitle}>Р’С–РґРіСѓРєРё РїСЂРѕ Р°СЂРѕРјР°С‚</h2>
        <p className={styles.commentsLead}>
          РўСѓС‚ РјРѕР¶РЅР° Р·Р°Р»РёС€РёС‚Рё РІР»Р°СЃРЅРµ РІСЂР°Р¶РµРЅРЅСЏ РїСЂРѕ Р·РІСѓС‡Р°РЅРЅСЏ, СЃС‚С–Р№РєС–СЃС‚СЊ, С€Р»РµР№С„
          Р°Р±Рѕ РґРѕСЂРµС‡РЅС–СЃС‚СЊ Р°СЂРѕРјР°С‚Сѓ РІ СЂС–Р·РЅРёС… СЃРёС‚СѓР°С†С–СЏС….
        </p>
      </header>

      <FragranceCommentForm
        fragranceId={fragranceId}
        refreshPath={refreshPath}
        loginHref={loginHref}
      />

      {comments.length ? (
        <div className={styles.commentsTree}>
          {comments.map((item) => (
            <CommentNode key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className={styles.commentsEmpty}>
          Р’С–РґРіСѓРєС–РІ С‰Рµ РЅРµРјР°С”. Р‘СѓРґСЊС‚Рµ РїРµСЂС€РёРјРё, С…С‚Рѕ РїРѕРґС–Р»РёС‚СЊСЃСЏ РІСЂР°Р¶РµРЅРЅСЏРј.
        </div>
      )}

      {pagination?.count ? (
        <p className={styles.commentsMessage}>
          Р’СЃСЊРѕРіРѕ РІС–РґРіСѓРєС–РІ: {pagination.count}
          {pagination.next ? ' В· С” С‰Рµ СЃС‚РѕСЂС–РЅРєРё' : ''}
        </p>
      ) : null}
    </section>
  );
}
