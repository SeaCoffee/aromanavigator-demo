'use client';

import { useState, useTransition } from 'react';

import { followToggleAction } from '@/app/actions/socialActions';
import { socialStyles } from '@/app/components/social/socialStyles';
import type { ID } from '@/app/types/http';

type Props = {
  userId: ID;
  publicUsername?: string | null;
  initialIsFollowing?: boolean;
  disabled?: boolean;
  buttonClassName?: string;
  messageClassName?: string;
};

export default function FollowToggleButton({
  userId,
  publicUsername,
  initialIsFollowing = false,
  disabled = false,
  buttonClassName = socialStyles.button,
  messageClassName = socialStyles.buttonMessage,
}: Props) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (disabled || isPending) {
      return;
    }

    setMessage('');

    startTransition(async () => {
      const result = await followToggleAction(userId, publicUsername);

      if (!result.ok) {
        setMessage(result.msg);
        return;
      }

      setIsFollowing(result.data.status === 'followed');
      setMessage(result.msg);
    });
  }

  return (
    <div className={socialStyles.buttonRoot}>
      <button
        type="button"
        disabled={disabled || isPending}
        onClick={toggle}
        className={buttonClassName}
      >
        {isPending
          ? 'Р—Р±РµСЂС–РіР°С”РјРѕ...'
          : isFollowing
            ? 'Р’С–РґРїРёСЃР°С‚РёСЃСЏ'
            : 'РџС–РґРїРёСЃР°С‚РёСЃСЏ'}
      </button>

      {disabled ? (
        <p className={messageClassName}>
          Р”С–СЏ РЅРµРґРѕСЃС‚СѓРїРЅР° С‡РµСЂРµР· Р±Р»РѕРєСѓРІР°РЅРЅСЏ.
        </p>
      ) : null}

      {message ? <p className={messageClassName}>{message}</p> : null}
    </div>
  );
}
