import { buttonStyles } from '@/app/components/common/buttonStyles';

import Link from 'next/link';
import { notFound } from 'next/navigation';

import ForumLikeButton from '@/app/components/forum/ForumLikeButton';
import MediaImage from '@/app/components/images/MediaImage';
import ShareButton from '@/app/components/share/ShareButton';
import SubscriptionToggle from '@/app/components/social/SubscriptionToggle';
import { PublicUserRoleBadge } from '@/app/components/users/PublicUserRoleBadge';
import { siteUrl } from '@/app/constants/siteConstants';
import { getUserServer } from '@/app/lib/session';
import {
  getForumSectionServer,
  getForumTopicsServer,
} from '@/app/services/forumServerServices';
import type { ForumSection, ForumTopic, Paginated } from '@/app/types/forumTypes';
import type { SubscriptionTarget } from '@/app/types/socialTypes';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';
import { pickMediaUrl } from '@/app/utils/MediaUrlUtils';
import { forumTopicLikeTarget } from '@/app/utils/likeTargetBuilders';
import { paginatedResults } from '@/app/utils/valueUtils';

type SearchParams = Record<string, string | string[] | undefined>;

function topicCover(topic: ForumTopic): string | null {
  return pickMediaUrl(topic.cover, topic.attachments) || null;
}

function buildSearchQuery(sp: SearchParams, patch: Record<string, string | null>) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(sp)) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value != null) {
      params.set(key, value);
    }
  }

  for (const [key, value] of Object.entries(patch)) {
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  return Object.fromEntries(params);
}

export default async function ForumSectionPage({
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

  const page = Math.max(1, Number(sp.page ?? 1));
  let section: ForumSection;

  try {
    section = await getForumSectionServer(id);
  } catch {
    notFound();
  }

  const topicsData = await getForumTopicsServer({
    section: id,
    page,
    ...(typeof sp.tag === 'string' && sp.tag ? { tag: sp.tag } : {}),
    ...(typeof sp.search === 'string' && sp.search ? { search: sp.search } : {}),
  }).catch(() => []);

  const topics = paginatedResults<ForumTopic>(
    topicsData as Paginated<ForumTopic> | ForumTopic[],
  );

  const paginated = topicsData as Paginated<ForumTopic>;
  const hasPrev = Boolean(paginated?.prev);
  const hasNext = Boolean(paginated?.next);
  const totalPages = Number(paginated?.total_pages ?? 1);
  const sectionPath = forumPageUrlBuilder.sections.detail(section.id);
  const user = await getUserServer();

  const sectionSubscriptionTarget: SubscriptionTarget = {
    app: 'forum',
    model: 'forumsectionmodel',
    id: section.id,
  };

  return (
    <main className="container mx-auto px-4 py-6">
      <nav className="mb-4 flex flex-wrap gap-2 text-sm text-gray-500">
        <Link href={forumPageUrlBuilder.home()} className="hover:underline">
          Р”Рѕ С„РѕСЂСѓРјСѓ
        </Link>
      </nav>

      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{section.title}</h1>

          {section.description ? (
            <p className="mt-1 text-sm text-gray-600">{section.description}</p>
          ) : null}

          <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span>РўРµРј: {section.topics_count}</span>
            <span>РљРѕРјРµРЅС‚Р°СЂС–РІ: {section.comments_count}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-2">
          {user ? (
            <SubscriptionToggle
              target={sectionSubscriptionTarget}
              currentPath={sectionPath}
              buttonClassName={buttonStyles.secondary}
            />
          ) : (
            <Link
              href={authPageUrlBuilder.login({ next: sectionPath })}
              className={buttonStyles.secondary}
            >
              РџС–РґРїРёСЃР°С‚РёСЃСЏ
            </Link>
          )}

          <ShareButton
            url={siteUrl(sectionPath)}
            title={section.title}
            text="Р РѕР·РґС–Р» РїР°СЂС„СѓРјРµСЂРЅРѕРіРѕ С„РѕСЂСѓРјСѓ AromaNavigator."
          />

          <Link
            href={
              user
                ? forumPageUrlBuilder.topics.create({
                    section: String(section.id),
                  })
                : authPageUrlBuilder.login({
                    next: forumPageUrlBuilder.topics.create({
                      section: String(section.id),
                    }),
                  })
            }
            className={buttonStyles.secondary}
          >
            РќРѕРІР° С‚РµРјР°
          </Link>
        </div>
      </header>

      <form
        method="get"
        className="mb-5 grid gap-2 sm:grid-cols-[1fr_220px_auto_auto]"
      >
        <input
          type="search"
          name="search"
          defaultValue={typeof sp.search === 'string' ? sp.search : ''}
          placeholder="РџРѕС€СѓРє РїРѕ С‚РµРјР°С…"
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />

        <input
          type="text"
          name="tag"
          defaultValue={typeof sp.tag === 'string' ? sp.tag : ''}
          placeholder="РўРµРі"
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
        />

        <button type="submit" className={buttonStyles.secondary}>
          Р¤С–Р»СЊС‚СЂСѓРІР°С‚Рё
        </button>

        {sp.search || sp.tag ? (
          <Link
            href={forumPageUrlBuilder.sections.detail(id)}
            className={buttonStyles.secondary}
          >
            РЎРєРёРЅСѓС‚Рё
          </Link>
        ) : null}
      </form>

      <section className="grid gap-4">
        {topics.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-500">
            РўРµРј РїРѕРєРё РЅРµРјР°С”.
          </div>
        ) : null}

        {topics.map((topic) => {
          const cover = topicCover(topic);
          const topicPath = forumPageUrlBuilder.topics.detail(topic.id);

          return (
            <article
              key={topic.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 transition hover:shadow-sm"
            >
              <div className="flex gap-4">
                <div className="hidden h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50 sm:block">
                  <MediaImage
                    src={cover}
                    alt={topic.title}
                    className="h-full w-full object-cover"
                    fallbackClassName="grid h-full w-full place-items-center text-[10px] text-gray-400"
                    fallback="Р‘РµР· Р·РѕР±СЂР°Р¶РµРЅРЅСЏ"
                  />
                </div>

                <div className="min-w-0 flex-1">
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
                  </div>

                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <h2 className="font-medium leading-snug">
                        <Link href={topicPath} className="hover:underline">
                          {topic.title}
                        </Link>
                      </h2>

                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {topic.content}
                      </p>
                    </div>

                    {!topic.is_hidden ? (
                      <ForumLikeButton
                        target={forumTopicLikeTarget(topic.id)}
                        initialLiked={topic.is_liked_by_me}
                        initialCount={topic.likes_count}
                        initialMyLikeId={topic.my_like_id ?? null}
                        refreshPaths={[topicPath, sectionPath]}
                        size="sm"
                      />
                    ) : null}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      {topic.author_display_name ||
                        topic.author_username ||
                        'РљРѕСЂРёСЃС‚СѓРІР°С‡'}

                      <PublicUserRoleBadge
                        roleLabel={topic.author_role_label}
                        isStaff={topic.author_is_staff}
                      />
                    </span>

                    <span>РљРѕРјРµРЅС‚Р°СЂС–РІ: {topic.comments_count}</span>
                    <span>Р’РїРѕРґРѕР±Р°РЅСЊ: {topic.likes_count}</span>
                    <span>РџРµСЂРµРіР»СЏРґС–РІ: {topic.views_count}</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href={forumPageUrlBuilder.sections.detail(
              id,
              buildSearchQuery(sp, {
                page: String(Math.max(1, page - 1)),
              }),
            )}
            className={`rounded-xl border border-gray-200 px-3 py-2 text-sm ${
              !hasPrev ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'
            }`}
            aria-disabled={!hasPrev}
          >
            РџРѕРїРµСЂРµРґРЅСЏ
          </Link>

          <span className="text-sm text-gray-600">
            РЎС‚РѕСЂС–РЅРєР° {page} Р· {totalPages}
          </span>

          <Link
            href={forumPageUrlBuilder.sections.detail(
              id,
              buildSearchQuery(sp, {
                page: String(Math.min(totalPages, page + 1)),
              }),
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
    </main>
  );
}
