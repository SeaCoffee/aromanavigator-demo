'use client';

import { useEffect, useState, useTransition } from 'react';

import { toggleLikeAction } from '@/app/actions/likeActions';
import { likeButtonStyles } from '@/app/components/likes/likeButtonStyles';
import { getNextLikeCount } from '@/app/components/likes/likeButtonUtils';
import type { LikeActionOptions, LikeTarget } from '@/app/types/likeTypes';

type Props = {
  target: LikeTarget;
  initialLiked: boolean;
  initialCount: number;
  disabled?: boolean;
  className?: string;
  revalidatePaths?: LikeActionOptions['revalidatePaths'];
};

export default function LikeButton({
  target,
  initialLiked,
  initialCount,
  disabled = false,
  className = '',
  revalidatePaths,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  function handleClick() {
    if (isPending || disabled) {
      return;
    }

    setError('');

    const previousLiked = liked;
    const previousCount = count;
    const optimisticLiked = !previousLiked;

    setLiked(optimisticLiked);
    setCount(getNextLikeCount(previousCount, previousLiked, optimisticLiked));

    startTransition(async () => {
      const result = await toggleLikeAction(
        target,
        revalidatePaths?.length ? { revalidatePaths } : undefined,
      );

      if (!result.ok) {
    setLiked(previousLiked);
    setCount(previousCount);
    setError(result.msg || 'РЈРІС–Р№РґС–С‚СЊ РІ Р°РєР°СѓРЅС‚, С‰РѕР± РїРѕСЃС‚Р°РІРёС‚Рё РІРїРѕРґРѕР±Р°РЅРЅСЏ.');
    return;
  }

      setLiked(result.liked);
      setCount(getNextLikeCount(previousCount, previousLiked, result.liked));
    });
  }

  const isButtonDisabled = disabled || isPending;

  return (
    <div className={likeButtonStyles.root}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isButtonDisabled}
        aria-pressed={liked}
        className={[
          likeButtonStyles.buttonBase,
          liked ? likeButtonStyles.buttonLiked : likeButtonStyles.buttonDefault,
          isButtonDisabled ? likeButtonStyles.buttonDisabled : '',
          className,
        ].join(' ')}
      >
        <span aria-hidden="true">{liked ? 'в™Ґ' : 'в™Ў'}</span>
        <span>{count}</span>
      </button>

      {error ? <p className={likeButtonStyles.error}>{error}</p> : null}
    </div>
  );
}
