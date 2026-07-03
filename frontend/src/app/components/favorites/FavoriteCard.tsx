'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import { deleteFavoriteAction } from '@/app/actions/favoriteActions';
import {
  getFavoriteItemGroup,
  getFavoriteItemHref,
  getFavoriteItemImage,
  getFavoriteItemMeta,
  getFavoriteItemTitle,
} from '@/app/components/favorites/favoriteHelpers';
import { favoriteStyles } from '@/app/components/favorites/favoriteStyles';
import MediaImage from '@/app/components/images/MediaImage';
import type { FavoriteItem } from '@/app/types/favoriteTypes';

type Props = {
  favorite: FavoriteItem;
};

export default function FavoriteCard({ favorite }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const title = getFavoriteItemTitle(favorite.item);
  const image = getFavoriteItemImage(favorite.item);
  const meta = getFavoriteItemMeta(favorite.item);
  const href = getFavoriteItemHref(favorite.item);
  const group = getFavoriteItemGroup(favorite.item);
  const isUnavailable = group === 'unavailable';

  function handleDelete() {
    if (isPending) {
      return;
    }

    setError('');

    startTransition(async () => {
      const result = await deleteFavoriteAction(favorite.id);

      if (!result.ok) {
        setError(result.msg);
      }
    });
  }

  const imageNode = (
    <MediaImage
      src={image}
      alt={title}
      className={favoriteStyles.image}
      fallbackClassName={favoriteStyles.imagePlaceholder}
      fallback="в™Ў"
    />
  );

  return (
    <article
      className={[
        favoriteStyles.card,
        isUnavailable ? favoriteStyles.cardUnavailable : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        aria-label="РџСЂРёР±СЂР°С‚Рё Р· РѕР±СЂР°РЅРѕРіРѕ"
        title="РџСЂРёР±СЂР°С‚Рё Р· РѕР±СЂР°РЅРѕРіРѕ"
        className={[
          favoriteStyles.removeButton,
          isPending ? favoriteStyles.disabled : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        Г—
      </button>

      <div className={favoriteStyles.imageWrap}>
        {href ? (
          <Link href={href} className={favoriteStyles.imageLink}>
            {imageNode}
          </Link>
        ) : (
          imageNode
        )}
      </div>

      <div className={favoriteStyles.body}>
        <div className={favoriteStyles.textBlock}>
          {href ? (
            <Link href={href} className={favoriteStyles.cardTitleLink}>
              {title}
            </Link>
          ) : (
            <h3 className={favoriteStyles.cardTitle}>{title}</h3>
          )}

          {meta ? <p className={favoriteStyles.meta}>{meta}</p> : null}
        </div>

        <div className={favoriteStyles.cardActions}>
          {href ? (
            <Link href={href} className={favoriteStyles.openLink}>
              Р’С–РґРєСЂРёС‚Рё
            </Link>
          ) : null}
        </div>

        {error ? <p className={favoriteStyles.error}>{error}</p> : null}
      </div>
    </article>
  );
}
