import Link from 'next/link';

import { AppIcon } from '@/app/components/fragrances/AppLucideIcons';
import { fragranceCardStyles as styles } from '@/app/components/fragrances/fragranceEncyclopedia.styles';
import FavoriteButton from '@/app/components/favorites/FavoriteButton';
import MediaImage from '@/app/components/images/MediaImage';
import LikeButton from '@/app/components/likes/LikeButton';
import {
  getFragranceTitle,
  getReleaseYearLabel,
} from '@/app/selectors/fragranceSelectors';
import type { FragranceListItem } from '@/app/types/fragranceTypes';
import { favoriteTargets } from '@/app/types/favoriteTypes';
import { likeTargets } from '@/app/types/likeTypes';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';

type FragranceCardProps = {
  fragrance: FragranceListItem;
};

type FragranceCardCounters = FragranceListItem & {
  comments_count?: number;
  is_favorited?: boolean;
};

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getCounter(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : 0;
}

export default function FragranceCard({ fragrance }: FragranceCardProps) {
  const cardData = fragrance as FragranceCardCounters;

  const href = fragrancePageUrlBuilder.public.detail(fragrance.slug);
  const commentsHref = `${href}#comments`;

  const title = getFragranceTitle(fragrance);
  const brand = fragrance.brand.name;
  const year = getReleaseYearLabel(fragrance.release_year);
  const initials = getInitials(brand || fragrance.name || 'AN');

  const commentsCount = getCounter(cardData.comments_count);
  const isFavorited = Boolean(cardData.is_favorited);

  return (
    <article className={styles.root}>
      <header className={styles.top}>
        <div className={styles.logo}>{initials}</div>

        <div className={styles.account}>
          <p className={styles.accountName}>{brand}</p>
          <p className={styles.accountMeta}>
            {year ? `РђСЂРѕРјР°С‚ В· ${year}` : 'РђСЂРѕРјР°С‚ В· Р С–Рє РЅРµРІС–РґРѕРјРёР№'}
          </p>
        </div>
      </header>

      <Link href={href} className={styles.media} aria-label={title}>
        <MediaImage
          src={fragrance.cover_image}
          alt={title}
          className={styles.image}
          fallbackClassName={styles.imagePlaceholder}
          fallback={
            <span>{brand}</span>
          }
        />
        <span className={styles.imageOverlay} aria-hidden="true" />

        <div className={styles.content}>
          <div className={styles.contentTop}>
            <p className={styles.brand}>{brand}</p>
            {year ? <p className={styles.year}>{year}</p> : null}
          </div>

          <div className={styles.contentBottom}>
            <h2 className={styles.name}>{fragrance.name}</h2>
            <p className={styles.notes}>РїСЂРѕС„С–Р»СЊ В· РЅРѕС‚Рё В· Р°РєРѕСЂРґРё</p>
          </div>
        </div>
      </Link>

      <footer className={styles.footer}>
        <div className={styles.footerIcons}>
          <LikeButton
            target={likeTargets.fragrance(Number(fragrance.id))}
            initialLiked={fragrance.is_liked}
            initialCount={fragrance.likes_count}
            className={styles.likeButton}
          />

          <Link
            href={commentsHref}
            className={styles.counterItem}
            aria-label={`Р’С–РґРіСѓРєРё РїСЂРѕ Р°СЂРѕРјР°С‚ ${title}`}
            title="Р’С–РґРіСѓРєРё"
          >
            <AppIcon name="message" className={styles.icon} />
            <span>{commentsCount}</span>
          </Link>
        </div>

        <FavoriteButton
          target={favoriteTargets.fragrance(Number(fragrance.id))}
          initialFavorited={isFavorited}
          variant="icon"
          revalidatePaths={[href, fragrancePageUrlBuilder.public.list()]}
          ariaLabel={
            isFavorited
              ? `РџСЂРёР±СЂР°С‚Рё Р°СЂРѕРјР°С‚ ${title} Р· РѕР±СЂР°РЅРѕРіРѕ`
              : `Р”РѕРґР°С‚Рё Р°СЂРѕРјР°С‚ ${title} РґРѕ РѕР±СЂР°РЅРѕРіРѕ`
          }
        />
      </footer>
    </article>
  );
}
