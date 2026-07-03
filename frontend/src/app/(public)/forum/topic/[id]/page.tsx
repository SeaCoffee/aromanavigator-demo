import { buttonStyles } from '@/app/components/common/buttonStyles';

import Link from 'next/link';
import { notFound } from 'next/navigation';

import ForumCommentCreateForm from '@/app/components/forum/ForumCommentCreateForm';
import ForumCommentThread from '@/app/components/forum/ForumCommentThread';
import ForumLikeButton from '@/app/components/forum/ForumLikeButton';
import ForumTopicOwnerActions from '@/app/components/forum/ForumTopicOwnerActions';
import MediaImage from '@/app/components/images/MediaImage';
import ShareButton from '@/app/components/share/ShareButton';
import SubscriptionToggle from '@/app/components/social/SubscriptionToggle';
import { PublicUserRoleBadge } from '@/app/components/users/PublicUserRoleBadge';
import { siteUrl } from '@/app/constants/siteConstants';
import { getUserServer } from '@/app/lib/session';
import { getCommentsByTargetServer } from '@/app/services/commentServerServices';
import { getForumTopicServer } from '@/app/services/forumServerServices';
import type {
  ForumComment,
  ForumTopic,
  Paginated,
} from '@/app/types/forumTypes';
import type { SubscriptionTarget } from '@/app/types/socialTypes';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';
import { pickMediaUrl } from '@/app/utils/MediaUrlUtils';
import { forumTopicLikeTarget } from '@/app/utils/likeTargetBuilders';
import { paginatedResults } from '@/app/utils/valueUtils';
import { forumTopicStyles } from '@/app/components/forum/forumStyles';

type SearchParams = Record<string, string | string[] | undefined>;

function topicImageUrls(topic: ForumTopic): string[] {
  const urls = [
    ...(topic.cover?.image ? [topic.cover.image] : []),
    ...((topic.attachments || []).map((item) => item.image).filter(Boolean)),
  ];

  return Array.from(new Set(urls.map((url) => pickMediaUrl(url)).filter(Boolean)));
}

function queryWithCommentPage(
  searchParams: SearchParams,
  commentPage: number,
): Record<string, string> {
  const query: Record<string, string> = {};

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === 'cpage') {
      continue;
    }

    if (typeof value === 'string') {
      query[key] = value;
    }
  }

  query.cpage = String(commentPage);

  return query;
}

export default async function ForumTopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id: idStr } = await params;
  const sp = await searchParams;
  const id = Number(idStr);

  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  const commentPage = Math.max(1, Number(sp.cpage ?? 1));
  let topic: ForumTopic;

  try {
    topic = await getForumTopicServer(id);
  } catch {
    notFound();
  }

  const topicPath = forumPageUrlBuilder.topics.detail(topic.id);
  const sectionPath = forumPageUrlBuilder.sections.detail(topic.section);
  const user = await getUserServer();
  const loginHref = user
    ? undefined
    : authPageUrlBuilder.login({ next: topicPath });

  const commentsData = await getCommentsByTargetServer({
    app: 'forum',
    model: 'forumtopicmodel',
    id,
    page: commentPage,
  }).catch((error) => {
    console.error('Failed to load forum comments', error);
    return [];
  });

  const comments = paginatedResults<ForumComment>(
    commentsData as Paginated<ForumComment> | ForumComment[],
  );

  const paginatedComments = commentsData as Paginated<ForumComment>;
  const hasPrev = Boolean(paginatedComments?.prev);
  const hasNext = Boolean(paginatedComments?.next);
  const totalPages = Number(paginatedComments?.total_pages ?? 1);
  const images = topicImageUrls(topic);
  const refreshPaths = [topicPath, sectionPath];

  const topicSubscriptionTarget: SubscriptionTarget = {
    app: 'forum',
    model: 'forumtopicmodel',
    id: topic.id,
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <nav className="mb-4 flex flex-wrap gap-2 text-sm text-gray-500">
        <Link href={forumPageUrlBuilder.home()} className="hover:underline">
          Р¤РѕСЂСѓРј
        </Link>

        <span>/</span>

        <Link href={sectionPath} className="hover:underline">
          {topic.section_title || 'Р РѕР·РґС–Р» С„РѕСЂСѓРјСѓ'}
        </Link>
      </nav>

      <article className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {topic.is_pinned ? (
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] text-amber-700">
              Р·Р°РєСЂС–РїР»РµРЅРѕ
            </span>
          ) : null}

          {topic.is_locked ? (
            <span className="rounded-full bg-rose-50 px-2 py-1 text-[10px] text-rose-700">
              Р·Р°РєСЂРёС‚Рѕ
            </span>
          ) : null}

          {topic.is_hidden ? (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-600">
              РїСЂРёС…РѕРІР°РЅРѕ
            </span>
          ) : null}

          {topic.is_owner ? (
            <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] text-blue-700">
              РІР°С€Р° С‚РµРјР°
            </span>
          ) : null}
        </div>

        <div className={forumTopicStyles.actionBar}>
        {!topic.is_hidden ? (
          <ForumLikeButton
            target={forumTopicLikeTarget(topic.id)}
            initialLiked={topic.is_liked_by_me}
            initialCount={topic.likes_count}
            initialMyLikeId={topic.my_like_id ?? null}
            refreshPaths={refreshPaths}
          />
        ) : null}

        {!topic.is_hidden ? (
          user ? (
            <SubscriptionToggle
            target={topicSubscriptionTarget}
            currentPath={topicPath}
            buttonClassName={forumTopicStyles.actionButton}
          />
          ) : (
            <Link
              href={authPageUrlBuilder.login({ next: topicPath })}
              className={forumTopicStyles.actionButton}
            >
              РџС–РґРїРёСЃР°С‚РёСЃСЏ
            </Link>
          )
        ) : null}

        <ShareButton
        url={siteUrl(topicPath)}
        title={topic.title}
        text="РўРµРјР° Сѓ РїР°СЂС„СѓРјРµСЂРЅС–Р№ СЃРїС–Р»СЊРЅРѕС‚С– AromaNavigator."
        className={forumTopicStyles.actionButton}
      />

        {topic.is_owner ? (
          <ForumTopicOwnerActions
            topicId={topic.id}
            sectionId={topic.section}
            refreshPaths={refreshPaths}
          />
        ) : null}
      </div>


        <h1 className="text-2xl font-semibold leading-snug">{topic.title}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <MediaImage
              src={topic.author_avatar}
              alt={
                topic.author_display_name ||
                topic.author_username ||
                'РљРѕСЂРёСЃС‚СѓРІР°С‡'
              }
              className="h-5 w-5 rounded-full object-cover"
              fallbackClassName="inline-block h-5 w-5 rounded-full bg-gray-200"
              fallback=""
            />

            <span className="inline-flex items-center gap-1">
              {topic.author_display_name ||
                topic.author_username ||
                'РљРѕСЂРёСЃС‚СѓРІР°С‡'}

              <PublicUserRoleBadge
                roleLabel={topic.author_role_label}
                isStaff={topic.author_is_staff}
              />
            </span>
          </span>

          <span>РџРµСЂРµРіР»СЏРґС–РІ: {topic.views_count}</span>
          <span>Р’РїРѕРґРѕР±Р°РЅСЊ: {topic.likes_count}</span>
          <span>РљРѕРјРµРЅС‚Р°СЂС–РІ: {topic.comments_count}</span>
        </div>

        {topic.tags_read?.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {topic.tags_read.map((tag) => (
              <Link
                key={tag}
                href={forumPageUrlBuilder.sections.detail(topic.section, { tag })}
                className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
              >
                #{tag}
              </Link>
            ))}
          </div>
        ) : null}

        {images.length > 0 ? (
          <section className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
            {images.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="overflow-hidden rounded-xl bg-gray-50"
              >
                <MediaImage
                  src={src}
                  alt={`Р—РѕР±СЂР°Р¶РµРЅРЅСЏ С‚РµРјРё ${index + 1}`}
                  className="h-40 w-full object-cover md:h-48"
                  fallbackClassName="grid h-40 w-full place-items-center text-xs text-gray-400 md:h-48"
                  fallback="Р¤РѕС‚Рѕ РЅРµРґРѕСЃС‚СѓРїРЅРµ"
                />
              </div>
            ))}
          </section>
        ) : null}

        <div className="mt-4 whitespace-pre-wrap break-words text-sm text-gray-800">
          {topic.content}
        </div>
      </article>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">РљРѕРјРµРЅС‚Р°СЂС–</h2>

          <span className="text-xs text-gray-500">
            Р’СЃСЊРѕРіРѕ: {topic.comments_count}
          </span>
        </div>

        {topic.is_locked ? (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            РўРµРјР° Р·Р°РєСЂРёС‚Р° РґР»СЏ РєРѕРјРµРЅС‚Р°СЂС–РІ.
          </div>
        ) : (
          <ForumCommentCreateForm
            topicId={topic.id}
            refreshPaths={refreshPaths}
            loginHref={loginHref}
            canPublishOfficial={Boolean(user?.is_staff || user?.is_superuser)}
          />
        )}

        <div className="mt-4">
          <ForumCommentThread
            items={comments}
            topicId={topic.id}
            refreshPaths={refreshPaths}
            loginHref={loginHref}
            commentPagePath={topicPath}
            canPublishOfficial={Boolean(user?.is_staff || user?.is_superuser)}
          />
        </div>

        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href={forumPageUrlBuilder.topics.detail(
                id,
                queryWithCommentPage(sp, Math.max(1, commentPage - 1)),
              )}
              className={`rounded-xl border border-gray-200 px-3 py-2 text-sm ${
                !hasPrev ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'
              }`}
              aria-disabled={!hasPrev}
            >
              РџРѕРїРµСЂРµРґРЅСЏ
            </Link>

            <span className="text-sm text-gray-600">
              РЎС‚РѕСЂС–РЅРєР° РєРѕРјРµРЅС‚Р°СЂС–РІ {commentPage} Р· {totalPages}
            </span>

            <Link
              href={forumPageUrlBuilder.topics.detail(
                id,
                queryWithCommentPage(sp, Math.min(totalPages, commentPage + 1)),
              )}
              className={`rounded-xl border border-gray-200 px-3 py-2 text-sm ${
                !hasNext ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'
              }`}
              aria-disabled={!hasNext}
            >
              РќР°СЃС‚СѓРїРЅР°
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
