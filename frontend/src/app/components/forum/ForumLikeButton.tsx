'use client';

import { useEffect, useState, useTransition } from 'react';

import { toggleLikeAction } from '@/app/actions/likeActions';
import type { LikeTarget } from '@/app/types/likeTypes';

import { forumLikeButtonStyles } from './forumStyles';
import { isAuthLikeError, normalizeActionMessage } from './forumUtils';

type Props = {
  target: LikeTarget;
  initialLiked?: boolean;
  initialCount?: number;
  initialMyLikeId?: number | null;
  refreshPaths?: string[];
  size?: 'sm' | 'md';
  className?: string;
  showCount?: boolean;
  disabled?: boolean;
  disabledTitle?: string;
  onAuthError?: () => void;
};

export default function ForumLikeButton({
  target,
  initialLiked = false,
  initialCount = 0,
  initialMyLikeId = null,
  refreshPaths,
  size = 'sm',
  className = '',
  showCount = true,
  disabled = false,
  disabledTitle = 'Р”С–СЏ РЅРµРґРѕСЃС‚СѓРїРЅР°',
  onAuthError,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [myLikeId, setMyLikeId] = useState<number | null>(initialMyLikeId);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    setMyLikeId(initialMyLikeId);
  }, [initialMyLikeId]);

  const isButtonDisabled = disabled || isPending;

  const buttonClassName = [
    forumLikeButtonStyles.base,
    size === 'sm' ? forumLikeButtonStyles.sm : forumLikeButtonStyles.md,
    liked ? forumLikeButtonStyles.active : forumLikeButtonStyles.inactive,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handleClick = () => {
    if (isButtonDisabled) {
      return;
    }

    setError(null);

    const previousLiked = liked;
    const previousCount = count;
    const previousMyLikeId = myLikeId;

    setLiked(!previousLiked);
    setCount((value) => (previousLiked ? Math.max(0, value - 1) : value + 1));

    startTransition(async () => {
      const result = await toggleLikeAction(target, {
        revalidatePaths: refreshPaths,
      });

      if (result.ok) {
        setLiked(result.liked);
        setMyLikeId(result.like?.id ?? null);
        return;
      }

      setLiked(previousLiked);
      setCount(previousCount);
      setMyLikeId(previousMyLikeId);

      const message = normalizeActionMessage(result.msg);
      setError(message);

      if (isAuthLikeError(message)) {
        onAuthError?.();
      }
    });
  };

  return (
    <div className={forumLikeButtonStyles.wrap}>
      <button
        type="button"
        onClick={handleClick}
        disabled={isButtonDisabled}
        className={buttonClassName}
        aria-pressed={liked}
        title={
          disabled
            ? disabledTitle
            : liked
              ? 'РџСЂРёР±СЂР°С‚Рё РІРїРѕРґРѕР±Р°Р№РєСѓ'
              : 'Р’РїРѕРґРѕР±Р°С‚Рё'
        }
      >
        <span aria-hidden>{liked ? 'в™Ґ' : 'в™Ў'}</span>
        {showCount ? <span>{count}</span> : null}
      </button>

      {error ? <span className={forumLikeButtonStyles.error}>{error}</span> : null}
    </div>
  );
}
