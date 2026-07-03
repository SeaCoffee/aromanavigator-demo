'use client';

import { useState, useTransition } from 'react';

import { deleteSubscriptionAction } from '@/app/actions/socialActions';
import { socialStyles } from '@/app/components/social/socialStyles';
import type { ID } from '@/app/types/http';

type Props = {
  subscriptionId: ID;
};

export default function SubscriptionDeleteButton({ subscriptionId }: Props) {
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  return (
    <div className={socialStyles.buttonRoot}>
      <button
        type="button"
        disabled={isPending}
        className={socialStyles.unsubscribeIconButton}
        onClick={() => {
          setError('');
          startTransition(async () => {
            const result = await deleteSubscriptionAction(subscriptionId);
            if (!result.ok) setError(result.msg);
          });
        }}
      >
        {isPending ? '...' : 'Г—'}
      </button>
      {error ? <p className={socialStyles.buttonMessage}>{error}</p> : null}
    </div>
  );
}
