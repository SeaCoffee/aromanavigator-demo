import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import FragranceCommentsSection from '@/app/components/fragrances/comments/FragranceCommentsSection';
import { fragranceDetailStyles as styles } from '@/app/components/fragrances/fragranceEncyclopedia.styles';
import FragranceUgcSection from '@/app/components/fragrances/ugc/FragranceUgcSection';
import MediaImage from '@/app/components/images/MediaImage';
import LikeButton from '@/app/components/likes/LikeButton';
import ObjectPhotoGallery from '@/app/components/photos/ObjectPhotoGallery';
import ShareButton from '@/app/components/share/ShareButton';
import FragranceWardrobeStatusPanel from '@/app/components/wardrobe/FragranceWardrobeStatusPanel';
import { siteUrl } from '@/app/constants/siteConstants';
import { getUserServer } from '@/app/lib/session';
import {
  groupOfficialNotes,
  NOTE_LEVEL_LABELS,
} from '@/app/selectors/fragranceSelectors';
import { getCommentThreadByTargetServer } from '@/app/services/commentServerServices';
import {
  getBrandServer,
  getFragranceBySlugServer,
} from '@/app/services/fragranceServices.server';
import { getObjectPhotosServer } from '@/app/services/objectPhotoServices.server';
import { getMyWardrobeForFragranceServer } from '@/app/services/wardrobeServices.server';
import type { ForumCommentThreadItem, Paginated } from '@/app/types/forumTypes';
import { likeTargets } from '@/app/types/likeTypes';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { getFragranceImageUrl } from '@/app/utils/fragranceImageUtils';
import { fragrancePhotoTarget } from '@/app/utils/photoTargetBuilders';
import {
  absoluteImageUrl,
  buildSeoMetadata,
  truncateSeoText,
} from '@/app/utils/seoMetadata';
import { paginatedResults } from '@/app/utils/valueUtils';

type FragranceDetailSearchParams = {
  cpage?: string;
};

type FragranceDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<FragranceDetailSearchParams>;
};

function parsePositivePage(value?: string): number {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

function getCommentsPagination(
  data: Paginated<ForumCommentThreadItem> | ForumCommentThreadItem[],
) {
  return Array.isArray(data)
    ? undefined
    : {
        count: data.count,
        next: data.next,
        prev: data.prev,
      };
}

export async function generateMetadata({
  params,
}: FragranceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const fragrance = await getFragranceBySlugServer(slug).catch(() => null);

  if (!fragrance) {
    return buildSeoMetadata({
      title: 'РђСЂРѕРјР°С‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ',
      description: 'РЎС‚РѕСЂС–РЅРєСѓ Р°СЂРѕРјР°С‚Сѓ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.',
      path: fragrancePageUrlBuilder.public.detail(slug),
      noIndex: true,
    });
  }

  const noteNames = fragrance.official_notes
    .map((note) => note.name)
    .slice(0, 12)
    .join(', ');
  const familyNames = fragrance.families.map((family) => family.name).join(', ');
  const perfumerNames = fragrance.perfumers
    .map((perfumer) => perfumer.name)
    .join(', ');
  const title = `${fragrance.brand.name} ${fragrance.name}`;
  const description = truncateSeoText(
    [
      `${title}${fragrance.release_year ? `, ${fragrance.release_year}` : ''}.`,
      noteNames ? `РќРѕС‚Рё: ${noteNames}.` : '',
      familyNames ? `РЎС–РјРµР№СЃС‚РІР°: ${familyNames}.` : '',
      perfumerNames ? `РџР°СЂС„СѓРјРµСЂРё: ${perfumerNames}.` : '',
      'Р’С–РґРіСѓРєРё, С„РѕС‚Рѕ, РіР°СЂРґРµСЂРѕР± РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ С– СЃРїС–Р»СЊРЅРѕС‚Р°.',
    ]
      .filter(Boolean)
      .join(' '),
  );
  const imageUrl = absoluteImageUrl(getFragranceImageUrl(fragrance.cover_image));

  return buildSeoMetadata({
    title,
    description,
    path: fragrancePageUrlBuilder.public.detail(fragrance.slug),
    images: imageUrl
      ? [
          {
            url: imageUrl,
            alt: title,
          },
        ]
      : undefined,
    keywords: [
      fragrance.name,
      fragrance.brand.name,
      ...fragrance.official_notes.map((note) => note.name),
      ...fragrance.families.map((family) => family.name),
    ],
  });
}

export default async function FragranceDetailPage({
  params,
  searchParams,
}: FragranceDetailPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const fragrance = await getFragranceBySlugServer(slug).catch(() => null);

  if (!fragrance) {
    const brand = await getBrandServer(slug).catch(() => null);

    if (brand) {
      redirect(fragrancePageUrlBuilder.public.brandDetail(brand.slug));
    }

    notFound();
  }

  const commentsPage = parsePositivePage(resolvedSearchParams.cpage);
  const pagePath = fragrancePageUrlBuilder.public.detail(fragrance.slug);
  const shareUrl = siteUrl(pagePath);
  const fragranceTarget = fragrancePhotoTarget(fragrance.id);
  const user = await getUserServer();

  const [commentsData, wardrobeItems, objectPhotos] = await Promise.all([
    getCommentThreadByTargetServer({
      ...fragranceTarget,
      page: commentsPage,
      page_size: 20,
    }).catch(() => ({ results: [] })),
    user
      ? getMyWardrobeForFragranceServer(fragrance.id)
          .then((data) => data.results)
          .catch(() => [])
      : Promise.resolve([]),
    getObjectPhotosServer(fragranceTarget).catch(() => ({
      cover: null,
      attachments: [],
    })),
  ]);

  const notes = groupOfficialNotes(fragrance.official_notes);
  const image = getFragranceImageUrl(
    fragrance.cover_image || fragrance.cover?.image,
  );
  const comments = paginatedResults<ForumCommentThreadItem>(commentsData);
  const commentsPagination = getCommentsPagination(commentsData);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.media}>
          <MediaImage
            src={image}
            alt={`${fragrance.brand.name} ${fragrance.name}`}
            className={styles.image}
            fallbackClassName={styles.imagePlaceholder}
            fallback="Р‘РµР· С„РѕС‚Рѕ"
          />
        </div>

        <div className={styles.content}>
          <header className={styles.header}>
            <p className={styles.brand}>{fragrance.brand.name}</p>

            <h1 className={styles.title}>{fragrance.name}</h1>

            <div className={styles.meta}>
              <span>{fragrance.release_year ?? 'Р С–Рє РЅРµРІС–РґРѕРјРёР№'}</span>

              {user ? (
                <LikeButton
                  target={likeTargets.fragrance(Number(fragrance.id))}
                  initialLiked={fragrance.is_liked}
                  initialCount={fragrance.likes_count}
                />
              ) : (
                <Link
                  href={authPageUrlBuilder.login({ next: pagePath })}
                  title="РЈРІС–Р№РґС–С‚СЊ, С‰РѕР± РІРїРѕРґРѕР±Р°С‚Рё Р°СЂРѕРјР°С‚"
                  className="inline-flex items-center gap-2 rounded-[18px] border border-[#e0d2c5] bg-white px-3 py-1.5 text-sm font-bold text-[#3c322d] transition hover:bg-[#f6efe8]"
                >
                  <span aria-hidden="true">в™Ў</span>
                  <span>{fragrance.likes_count}</span>
                </Link>
              )}
              <ShareButton
                url={shareUrl}
                title={`${fragrance.brand.name} ${fragrance.name}`}
                text="РЎС‚РѕСЂС–РЅРєР° Р°СЂРѕРјР°С‚Сѓ РІ РґРѕРІС–РґРЅРёРєСѓ."
                className="inline-flex items-center gap-2 rounded-[18px] border border-[#e0d2c5] bg-white px-3 py-1.5 text-sm font-bold text-[#3c322d] transition hover:bg-[#f6efe8]"
              />
            </div>
          </header>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>РџР°СЂС„СѓРјРµСЂРё</h2>
            {fragrance.perfumers.length ? (
              <div className={styles.chips}>
                {fragrance.perfumers.map((perfumer) => (
                  <span key={perfumer.id} className={styles.chip}>
                    {perfumer.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className={styles.muted}>РџР°СЂС„СѓРјРµСЂС–РІ С‰Рµ РЅРµ РґРѕРґР°РЅРѕ.</p>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>РЎС–РјРµР№СЃС‚РІР°</h2>
            {fragrance.families.length ? (
              <div className={styles.chips}>
                {fragrance.families.map((family) => (
                  <span key={family.id} className={styles.chip}>
                    {family.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className={styles.muted}>РЎС–РјРµР№СЃС‚РІР° С‰Рµ РЅРµ РґРѕРґР°РЅРѕ.</p>
            )}
          </section>

          <FragranceWardrobeStatusPanel
            fragranceId={fragrance.id}
            refreshPath={pagePath}
            initialItems={wardrobeItems}
            isAuthenticated={Boolean(user)}
          />
        </div>
      </section>

      <nav className={styles.anchorNav} aria-label="Р РѕР·РґС–Р»Рё СЃС‚РѕСЂС–РЅРєРё Р°СЂРѕРјР°С‚Сѓ">
        <a href="#notes" className={styles.anchorLink}>РќРѕС‚Рё</a>
        <a href="#comments" className={styles.anchorLink}>Р’С–РґРіСѓРєРё</a>
        <a href="#community" className={styles.anchorLink}>РЎРїС–Р»СЊРЅРѕС‚Р°</a>
      </nav>

      <section id="notes" className={styles.notesSection}>
        <h2 className={styles.notesTitle}>РћС„С–С†С–Р№РЅС– РЅРѕС‚Рё</h2>

        <div className={styles.notesGrid}>
          {(['top', 'heart', 'base'] as const).map((level) => (
            <section key={level} className={styles.notesCard}>
              <h3 className={styles.notesCardTitle}>
                {NOTE_LEVEL_LABELS[level]}
              </h3>

              {notes[level].length ? (
                <div className={styles.chips}>
                  {notes[level].map((note) => (
                    <span
                      key={`${note.level}-${note.id}`}
                      className={styles.chip}
                    >
                      {note.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={styles.muted}>РќРѕС‚ С‰Рµ РЅРµРјР°С”.</p>
              )}
            </section>
          ))}
        </div>
      </section>

      <FragranceCommentsSection
        fragranceId={Number(fragrance.id)}
        refreshPath={pagePath}
        comments={comments}
        pagination={commentsPagination}
        loginHref={
          user
            ? undefined
            : authPageUrlBuilder.login({ next: pagePath })
        }
      />

      <ObjectPhotoGallery
        title="Р¤РѕС‚Рѕ РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ"
        photos={objectPhotos.attachments}
        emptyText="РљРѕСЂРёСЃС‚СѓРІР°С†СЊРєРёС… С„РѕС‚Рѕ С†СЊРѕРіРѕ Р°СЂРѕРјР°С‚Сѓ РїРѕРєРё РЅРµРјР°С”."
      />

      <details id="community" className={styles.communityDetails}>
        <summary className={styles.communitySummary}>
          <span>
            <strong className="block text-lg text-[#211b18]">РЎРїС–Р»СЊРЅРѕС‚Р°</strong>
            <span className="text-sm text-[#7a6d64]">
              РќРѕС‚Рё С‚Р° СЃС…РѕР¶С– Р°СЂРѕРјР°С‚Рё, Р·Р°РїСЂРѕРїРѕРЅРѕРІР°РЅС– РєРѕСЂРёСЃС‚СѓРІР°С‡Р°РјРё
            </span>
          </span>
          <span aria-hidden="true">+</span>
        </summary>
        <div className={styles.communityBody}>
          <FragranceUgcSection
            fragrance={fragrance}
            isAuthenticated={Boolean(user)}
            loginHref={authPageUrlBuilder.login({ next: pagePath })}
          />
        </div>
      </details>
    </main>
  );
}
