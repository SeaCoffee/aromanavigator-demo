import NotificationAnnouncementCard from '@/app/components/notifications/NotificationAnnouncementCard';
import { notificationStyles } from '@/app/components/notifications/notificationStyles';
import type { NotificationAnnouncement } from '@/app/types/notificationTypes';

type Props = {
  announcements: NotificationAnnouncement[];
};

export default function NotificationAnnouncementList({ announcements }: Props) {
  if (announcements.length === 0) {
    return null;
  }

  return (
    <section className={notificationStyles.section}>
      <h2 className={notificationStyles.sectionTitle}>РћРіРѕР»РѕС€РµРЅРЅСЏ РїР»Р°С‚С„РѕСЂРјРё</h2>

      <div className={notificationStyles.list}>
        {announcements.map((announcement) => (
          <NotificationAnnouncementCard
            key={announcement.id}
            announcement={announcement}
          />
        ))}
      </div>
    </section>
  );
}
