'use client';

import { useState, useTransition } from 'react';

import { markNotificationAnnouncementReadAction } from '@/app/actions/notificationActions';
import { formatNotificationDate } from '@/app/components/notifications/notificationFormatters';
import { notificationStyles } from '@/app/components/notifications/notificationStyles';
import type { NotificationAnnouncement } from '@/app/types/notificationTypes';

type Props = {
  announcement: NotificationAnnouncement;
};

export default function NotificationAnnouncementCard({ announcement }: Props) {
  const [isRead, setIsRead] = useState(announcement.is_read);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleMarkRead() {
    if (isRead || isPending) return;

    setError('');

    startTransition(async () => {
      const result = await markNotificationAnnouncementReadAction(announcement.id);

      if (!result.ok) {
        setError(result.msg);
        return;
      }

      setIsRead(true);
    });
  }

  return (
    <article
      className={
        isRead
          ? notificationStyles.announcementCardRead
          : notificationStyles.announcementCard
      }
    >
      <div className={notificationStyles.cardTop}>
        <div className="grid gap-1">
          <p className={notificationStyles.meta}>{announcement.kind_label}</p>
          <h2 className={notificationStyles.cardTitle}>{announcement.title}</h2>
          <p className={notificationStyles.meta}>
            {formatNotificationDate(announcement.created_at)}
          </p>
        </div>

        <span className={isRead ? notificationStyles.readBadge : notificationStyles.badge}>
          {isRead ? 'РџСЂРѕС‡РёС‚Р°РЅРѕ' : 'РќРѕРІРµ'}
        </span>
      </div>

      <p className={notificationStyles.cardBody}>{announcement.body}</p>

      {!isRead ? (
        <div className={notificationStyles.actions}>
          <button
            type="button"
            onClick={handleMarkRead}
            disabled={isPending}
            className={notificationStyles.button}
          >
            РџРѕР·РЅР°С‡РёС‚Рё РїСЂРѕС‡РёС‚Р°РЅРёРј
          </button>
        </div>
      ) : null}

      {error ? <p className={notificationStyles.error}>{error}</p> : null}
    </article>
  );
}
