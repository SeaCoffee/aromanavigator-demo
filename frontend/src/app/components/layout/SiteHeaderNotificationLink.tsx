import Link from 'next/link';

import { AppIcon } from '@/app/components/fragrances/AppLucideIcons';
import { siteHeaderStyles as styles } from '@/app/components/layout/siteHeader.styles';
import { getUserServer } from '@/app/lib/session';
import { getNotificationsUnreadCountServer } from '@/app/services/notificationServerServices';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';

async function getUnreadCount() {
  try {
    const data = await getNotificationsUnreadCountServer();

    return data.unread_count;
  } catch {
    return 0;
  }
}

export default async function SiteHeaderNotificationLink() {
  const user = await getUserServer();
  const href = user
    ? mePageUrlBuilder.notifications.list()
    : authPageUrlBuilder.login({
        next: mePageUrlBuilder.notifications.list(),
      });
  const unreadCount = user ? await getUnreadCount() : 0;

  return (
    <Link
      href={href}
      className={styles.actionLink}
      aria-label="РЎРїРѕРІС–С‰РµРЅРЅСЏ"
    >
      <AppIcon name="bell" className={styles.actionIcon} />

      {unreadCount > 0 ? (
        <span className={styles.notificationBadge}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
