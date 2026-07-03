// frontend/src/app/components/notifications/NotificationList.tsx

import NotificationCard from '@/app/components/notifications/NotificationCard';
import { notificationStyles } from '@/app/components/notifications/notificationStyles';
import type { NotificationItem } from '@/app/types/notificationTypes';

type Props = {
  notifications: NotificationItem[];
};

export default function NotificationList({ notifications }: Props) {
  if (notifications.length === 0) {
    return (
      <section className={notificationStyles.emptyCard}>
        РЎРїРѕРІС–С‰РµРЅСЊ РїРѕРєРё РЅРµРјР°С”.
      </section>
    );
  }

  return (
    <section className={notificationStyles.list}>
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
        />
      ))}
    </section>
  );
}
