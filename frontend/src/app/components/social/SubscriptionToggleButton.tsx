'use client';

import { useState, useTransition } from 'react';

import { subscriptionToggleAction } from '@/app/actions/socialActions';
import { socialStyles } from '@/app/components/social/socialStyles';
import type { SubscriptionTarget } from '@/app/types/socialTypes';

type Props = {
  target: SubscriptionTarget;
  initialIsSubscribed?: boolean;
  disabled?: boolean;
  currentPath?: string | null;
  subscribeLabel?: string;
  unsubscribeLabel?: string;
  pendingLabel?: string;
  buttonClassName?: string;
  messageClassName?: string;
};

export default function SubscriptionToggleButton({
  target,
  initialIsSubscribed = false,
  disabled = false,
  currentPath = null,
  subscribeLabel = 'РџС–РґРїРёСЃР°С‚РёСЃСЏ',
  unsubscribeLabel = 'Р’С–РґРїРёСЃР°С‚РёСЃСЏ',
  pendingLabel = 'Р—Р±РµСЂС–РіР°С”РјРѕ...',
  buttonClassName = socialStyles.compactButton,
  messageClassName = socialStyles.buttonMessage,
}: Props) {
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (disabled || isPending) {
      return;
    }

    setMessage('');

    startTransition(async () => {
      const result = await subscriptionToggleAction(
        target,
        isSubscribed,
        currentPath,
      );

      if (!result.ok) {
        setMessage(result.msg);
        return;
      }

      setIsSubscribed(!isSubscribed);
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
          ? pendingLabel
          : isSubscribed
            ? unsubscribeLabel
            : subscribeLabel}
      </button>

      {disabled ? <p className={messageClassName}>Р”С–СЏ РЅРµРґРѕСЃС‚СѓРїРЅР°.</p> : null}
      {message ? <p className={messageClassName}>{message}</p> : null}
    </div>
  );
}
