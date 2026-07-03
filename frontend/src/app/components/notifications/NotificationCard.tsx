'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import {
  deleteNotificationAction,
  markNotificationReadAction,
} from '@/app/actions/notificationActions';
import {
  formatNotificationDate,
  getNotificationPayloadText,
  getNotificationTargetHref,
  getNotificationTitle,
  shouldShowPayload,
} from '@/app/components/notifications/notificationFormatters';
import { notificationStyles } from '@/app/components/notifications/notificationStyles';
import type { NotificationItem } from '@/app/types/notificationTypes';

type Props = {
  notification: NotificationItem;
};

export default function NotificationCard({ notification }: Props) {
  const [isRead, setIsRead] = useState(notification.is_read);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const payloadText = getNotificationPayloadText(notification.payload);
  const targetHref = getNotificationTargetHref(notification);
  const title = getNotificationTitle(notification);

  function handleMarkRead() {
    if (isRead || isPending) return;

    setError('');

    startTransition(async () => {
      const result = await markNotificationReadAction(notification.id);

      if (!result.ok) {
        setError(result.msg);
        return;
      }

      setIsRead(true);
    });
  }

  function handleDelete() {
    if (isPending) return;

    setError('');

    startTransition(async () => {
      const result = await deleteNotificationAction(notification.id);

      if (!result.ok) {
        setError(result.msg);
      }
    });
  }

  return (
    <article className={isRead ? notificationStyles.card : notificationStyles.cardUnread}>
      <div className={notificationStyles.cardTop}>
        <div>
          <h2 className={notificationStyles.cardTitle}>
            {targetHref ? (
              <Link
                href={targetHref}
                onClick={handleMarkRead}
                className="hover:underline"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </h2>

          <p className={notificationStyles.meta}>
            {formatNotificationDate(notification.created_at)}
          </p>
        </div>

        <span className={isRead ? notificationStyles.readBadge : notificationStyles.badge}>
          {isRead ? 'РџСЂРѕС‡РёС‚Р°РЅРѕ' : 'РќРѕРІРµ'}
        </span>
      </div>

      {shouldShowPayload(notification) ? (
        <div className={notificationStyles.payload}>
          {payloadText}
        </div>
      ) : null}

      <div className={notificationStyles.actions}>
        {!isRead ? (
          <button
            type="button"
            onClick={handleMarkRead}
            disabled={isPending}
            className={notificationStyles.button}
          >
            РџРѕР·РЅР°С‡РёС‚Рё РїСЂРѕС‡РёС‚Р°РЅРёРј
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className={notificationStyles.dangerButton}
        >
          Р’РёРґР°Р»РёС‚Рё
        </button>
      </div>

      {error ? <p className={notificationStyles.error}>{error}</p> : null}
    </article>
  );
}
