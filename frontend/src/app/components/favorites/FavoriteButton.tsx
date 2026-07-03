'use client';

import { useEffect, useState, useTransition } from 'react';

import { toggleFavoriteAction } from '@/app/actions/favoriteActions';
import { AppIcon } from '@/app/components/fragrances/AppLucideIcons';
import { favoriteStyles } from '@/app/components/favorites/favoriteStyles';
import type {
  FavoriteActionOptions,
  FavoriteTarget,
} from '@/app/types/favoriteTypes';

type FavoriteButtonVariant = 'text' | 'icon';

type Props = {
  target: FavoriteTarget;
  initialFavorited: boolean;
  revalidatePaths?: FavoriteActionOptions['revalidatePaths'];
  disabled?: boolean;
  className?: string;
  variant?: FavoriteButtonVariant;
  ariaLabel?: string;
};

export default function FavoriteButton({
  target,
  initialFavorited,
  revalidatePaths,
  disabled = false,
  className = '',
  variant = 'text',
  ariaLabel,
}: Props) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFavorited(initialFavorited);
  }, [initialFavorited]);

  function handleClick() {
    if (disabled || isPending) {
      return;
    }

    setError('');

    const previousValue = favorited;
    const optimisticValue = !previousValue;

    setFavorited(optimisticValue);

    startTransition(async () => {
      const result = await toggleFavoriteAction(
        target,
        revalidatePaths?.length ? { revalidatePaths } : undefined,
      );

      if (!result.ok) {
        setFavorited(previousValue);
        setError(result.msg);
        return;
      }

      setFavorited(result.favorited);
    });
  }

  const isButtonDisabled = disabled || isPending;

  if (variant === 'icon') {
    return (
      <div className={favoriteStyles.inlineRoot}>
        <button
          type="button"
          onClick={handleClick}
          disabled={isButtonDisabled}
          aria-pressed={favorited}
          aria-label={
            ariaLabel ??
            (favorited ? 'РџСЂРёР±СЂР°С‚Рё Р· РѕР±СЂР°РЅРѕРіРѕ' : 'Р”РѕРґР°С‚Рё РґРѕ РѕР±СЂР°РЅРѕРіРѕ')
          }
          title={favorited ? 'Р’ РѕР±СЂР°РЅРѕРјСѓ' : 'Р”РѕРґР°С‚Рё РґРѕ РѕР±СЂР°РЅРѕРіРѕ'}
          className={[
            favorited
              ? favoriteStyles.favoriteIconButtonOn
              : favoriteStyles.favoriteIconButtonOff,
            isButtonDisabled ? favoriteStyles.disabled : '',
            className,
          ].join(' ')}
        >
          <AppIcon name="bookmark" className={favoriteStyles.favoriteIcon} />
        </button>

        {error ? <p className={favoriteStyles.error}>{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={favoriteStyles.inlineRoot}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isButtonDisabled}
        aria-pressed={favorited}
        className={[
          favorited
            ? favoriteStyles.favoriteButtonOn
            : favoriteStyles.favoriteButtonOff,
          isButtonDisabled ? favoriteStyles.disabled : '',
          className,
        ].join(' ')}
      >
        <AppIcon
          name={favorited ? 'check' : 'plus'}
          className={favoriteStyles.favoriteIcon}
        />
        <span>{favorited ? 'Р’ РѕР±СЂР°РЅРѕРјСѓ' : 'Р’ РѕР±СЂР°РЅРµ'}</span>
      </button>

      {error ? <p className={favoriteStyles.error}>{error}</p> : null}
    </div>
  );
}
