'use client';

import { useState, useTransition } from 'react';

import {
  deleteReadNotificationsAction,
  markAllNotificationsReadAction,
} from '@/app/actions/notificationActions';
import { notificationStyles } from '@/app/components/notifications/notificationStyles';

type Props = {
  totalCount: number;
  unreadCount: number;
};

export default function NotificationToolbar({ totalCount, unreadCount }: Props) {
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function runAction(action: () => Promise<{ ok: true; msg?: string } | { ok: false; msg: string }>) {
    if (isPending) return;

    setError('');
    startTransition(async () => {
      const result = await action();

      if (!result.ok) setError(result.msg);
    });
  }

  return (
    <section className={notificationStyles.toolbar}>
      <div className={notificationStyles.toolbarMeta}>
        <span className={notificationStyles.counter}>
          РЈСЃСЊРѕРіРѕ <strong>{totalCount}</strong>
        </span>
        <span className={notificationStyles.counter}>
          РќРµРїСЂРѕС‡РёС‚Р°РЅС– <strong>{unreadCount}</strong>
        </span>
      </div>

      <div className={notificationStyles.toolbarActions}>
        <button
          type="button"
          onClick={() => runAction(markAllNotificationsReadAction)}
          disabled={isPending || unreadCount === 0}
          className={notificationStyles.button}
        >
          РџСЂРѕС‡РёС‚Р°С‚Рё РІСЃС–
        </button>
        <button
          type="button"
          onClick={() => runAction(deleteReadNotificationsAction)}
          disabled={isPending}
          className={notificationStyles.button}
        >
          Р’РёРґР°Р»РёС‚Рё РїСЂРѕС‡РёС‚Р°РЅС–
        </button>
      </div>

      {error ? <p className={notificationStyles.error}>{error}</p> : null}
    </section>
  );
}
