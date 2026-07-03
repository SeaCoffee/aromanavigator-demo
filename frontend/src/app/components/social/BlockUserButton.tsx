'use client';

import { useState, useTransition } from 'react';

import { blockToggleAction } from '@/app/actions/socialActions';
import { socialStyles } from '@/app/components/social/socialStyles';
import type { ID } from '@/app/types/http';

type Props = {
  userId: ID;
  publicUsername?: string | null;
  initialIsBlockedByMe?: boolean;
  buttonClassName?: string;
  messageClassName?: string;
};

export default function BlockUserButton({
  userId,
  publicUsername,
  initialIsBlockedByMe = false,
  buttonClassName = socialStyles.button,
  messageClassName = socialStyles.buttonMessage,
}: Props) {
  const [isBlockedByMe, setIsBlockedByMe] = useState(initialIsBlockedByMe);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (isPending) {
      return;
    }

    setMessage('');

    startTransition(async () => {
      const result = await blockToggleAction(userId, publicUsername);

      if (!result.ok) {
        setMessage(result.msg);
        return;
      }

      setIsBlockedByMe(result.data.status === 'blocked');
      setMessage(result.msg);
    });
  }

  return (
    <div className={socialStyles.buttonRoot}>
      <button
        type="button"
        disabled={isPending}
        onClick={toggle}
        className={buttonClassName}
      >
        {isPending
          ? 'Р—Р±РµСЂС–РіР°С”РјРѕ...'
          : isBlockedByMe
            ? 'Р РѕР·Р±Р»РѕРєСѓРІР°С‚Рё РєРѕСЂРёСЃС‚СѓРІР°С‡Р°'
            : 'Р—Р°Р±Р»РѕРєСѓРІР°С‚Рё РєРѕСЂРёСЃС‚СѓРІР°С‡Р°'}
      </button>

      {message ? <p className={messageClassName}>{message}</p> : null}
    </div>
  );
}
