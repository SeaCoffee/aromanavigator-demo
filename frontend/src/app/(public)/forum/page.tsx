import type { Metadata } from 'next';
import Link from 'next/link';

import { forumPageStyles as styles } from '@/app/components/forum/forumPage.styles';
import MediaImage from '@/app/components/images/MediaImage';
import {
  getForumSectionsServer,
  getForumTopicsServer,
} from '@/app/services/forumServerServices';
import { getPopularTagsServer } from '@/app/services/tagServices.server';
import { getUserServer } from '@/app/lib/session';
import type {
  ForumSection,
  ForumTopic,
  Paginated,
  Tag,
} from '@/app/types/forumTypes';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { pickMediaUrl } from '@/app/utils/MediaUrlUtils';
import { buildSeoMetadata } from '@/app/utils/seoMetadata';
import { paginatedResults } from '@/app/utils/valueUtils';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Р¤РѕСЂСѓРј',
  description:
    'Р¤РѕСЂСѓРј РїР°СЂС„СѓРјРµСЂРЅРѕС— СЃРїС–Р»СЊРЅРѕС‚Рё: СЂРѕР·РґС–Р»Рё, С‚РµРјРё, РІС–РґРїРѕРІС–РґС–, С‚РµРіРё, РѕР±РіРѕРІРѕСЂРµРЅРЅСЏ Р°СЂРѕРјР°С‚С–РІ С‚Р° РґРѕСЃРІС–РґСѓ РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ.',
  path: forumPageUrlBuilder.home(),
  keywords: ['С„РѕСЂСѓРј Р°СЂРѕРјР°С‚С–РІ', 'РїР°СЂС„СѓРјРµСЂРЅРёР№ С„РѕСЂСѓРј', 'РѕР±РіРѕРІРѕСЂРµРЅРЅСЏ РїР°СЂС„СѓРјС–РІ'],
});

type SearchParams = Record<string, string | string[] | undefined>;

function sectionCover(section: ForumSection): string | null {
  return pickMediaUrl(section.cover, section.attachments) || null;
}

function readString(value: string | string[] | undefined) {
  return typeof value === 'string' ? value.trim() : '';
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const search = readString(sp.search);
  const tag = readString(sp.tag).replace(/^#/, '');

  const [sectionsData, topicsData, tagsData, user] = await Promise.all([
    getForumSectionsServer({ ordering: 'order,title' }).catch(() => []),
    getForumTopicsServer({
      page_size: 12,
      ordering: '-last_activity_at',
      ...(search ? { search } : {}),
      ...(tag ? { tag } : {}),
    }).catch(() => []),
    getPopularTagsServer({ page_size: 12 }).catch(() => ({ results: [] })),
    getUserServer(),
  ]);

  const sections = paginatedResults<ForumSection>(
    sectionsData as Paginated<ForumSection> | ForumSection[],
  );

  const topics = paginatedResults<ForumTopic>(
    topicsData as Paginated<ForumTopic> | ForumTopic[],
  );

  const tags = paginatedResults<Tag>(tagsData as Paginated<Tag> | Tag[]);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>Р¤РѕСЂСѓРј</h1>

            <p className={styles.lead}>
              Р РѕР·РґС–Р»Рё, РѕР±РіРѕРІРѕСЂРµРЅРЅСЏ, С‚РµРіРё С‚Р° РІС–РґРїРѕРІС–РґС– СЃРїС–Р»СЊРЅРѕС‚Рё.
            </p>
          </div>

          <Link
            href={
              user
                ? forumPageUrlBuilder.topics.create()
                : authPageUrlBuilder.login({
                    next: forumPageUrlBuilder.topics.create(),
                  })
            }
            className={styles.actionLink}
          >
            РЎС‚РІРѕСЂРёС‚Рё С‚РµРјСѓ
          </Link>
        </header>

        <form method="get" className={styles.searchForm}>
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="РџРѕС€СѓРє Р·Р° С‚РµРјР°РјРё"
            className={styles.input}
          />

          <input
            type="text"
            name="tag"
            defaultValue={tag}
            placeholder="РўРµРі"
            className={styles.input}
          />

          <button type="submit" className={styles.button}>
            Р—РЅР°Р№С‚Рё
          </button>
        </form>

        <section className={styles.sectionGrid}>
          <div className={styles.sectionColumn}>
            <h2 className={styles.sectionTitle}>Р РѕР·РґС–Р»Рё</h2>

            {sections.length === 0 ? (
              <div className={styles.empty}>Р РѕР·РґС–Р»С–РІ РїРѕРєРё РЅРµРјР°С”.</div>
            ) : (
              <div className={styles.cardGrid}>
                {sections.map((section) => {
                  const cover = sectionCover(section);

                  return (
                    <Link
                      key={section.id}
                      href={forumPageUrlBuilder.sections.detail(section.id)}
                      className={styles.sectionCard}
                    >
                      <div className={styles.cover}>
                        <MediaImage
                          src={cover}
                          alt={section.title}
                          className={styles.coverImage}
                          fallbackClassName={styles.coverFallback}
                          fallback="Р‘РµР· РѕР±РєР»Р°РґРёРЅРєРё"
                        />
                      </div>

                      <div className={styles.cardBody}>
                        <div className={styles.cardTop}>
                          <h3 className={styles.cardTitle}>{section.title}</h3>

                          {!section.is_active ? (
                            <span className={styles.badge}>РЅРµР°РєС‚РёРІРЅРёР№</span>
                          ) : null}
                        </div>

                        <p className={styles.muted}>
                          {section.description || 'Р‘РµР· РѕРїРёСЃСѓ'}
                        </p>

                        <div className={styles.stats}>
                          <span>РўРµРј: {section.topics_count}</span>
                          <span>РљРѕРјРµРЅС‚Р°СЂС–РІ: {section.comments_count}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <aside className={styles.tagsColumn}>
            <h2 className={styles.sectionTitle}>РџРѕРїСѓР»СЏСЂРЅС– С‚РµРіРё</h2>

            <div className={styles.tagsPanel}>
              <div className={styles.tagList}>
                {tags.length > 0 ? (
                  tags.map((item) => (
                    <Link
                      key={item.id}
                      href={forumPageUrlBuilder.byTag(item.code)}
                      className={styles.tag}
                    >
                      #{item.code}
                    </Link>
                  ))
                ) : (
                  <span className={styles.muted}>РўРµРіС–РІ РїРѕРєРё РЅРµРјР°С”.</span>
                )}
              </div>
            </div>
          </aside>
        </section>

        <section className={styles.sectionColumn}>
          <h2 className={styles.sectionTitle}>РћСЃС‚Р°РЅРЅС– С‚РµРјРё</h2>

          {topics.length === 0 ? (
            <div className={styles.empty}>РўРµРј Р·Р° С†РёРј Р·Р°РїРёС‚РѕРј РЅРµРјР°С”.</div>
          ) : (
            <div className={styles.topicList}>
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={forumPageUrlBuilder.topics.detail(topic.id)}
                  className={styles.topicCard}
                >
                  <div className={styles.topicMeta}>
                    <span>{topic.section_title ?? 'Р¤РѕСЂСѓРј'}</span>
                    <span>РљРѕРјРµРЅС‚Р°СЂС–РІ: {topic.comments_count}</span>
                    <span>Р’РїРѕРґРѕР±Р°РЅСЊ: {topic.likes_count}</span>
                  </div>

                  <h3 className={styles.cardTitle}>{topic.title}</h3>

                  <p className={styles.muted}>{topic.content}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
