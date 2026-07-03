import ActivityEventCard from '@/app/components/activity/ActivityEventCard';
import { isVisibleActivityEvent } from '@/app/components/activity/activityFormatters';
import { activityStyles } from '@/app/components/activity/activityStyles';
import type { ActivityEvent } from '@/app/types/activityTypes';

type Props = {
  events: ActivityEvent[];
  emptyText?: string;
};

export default function ActivityEventList({
  events,
  emptyText = 'РџРѕРґС–Р№ РїРѕРєРё РЅРµРјР°С”.',
}: Props) {
  const visibleEvents = events.filter(isVisibleActivityEvent);

  if (visibleEvents.length === 0) {
    return (
      <section className={activityStyles.emptyCard}>
        {emptyText}
      </section>
    );
  }

  return (
    <section className={activityStyles.list}>
      {visibleEvents.map((event) => (
        <ActivityEventCard key={event.id} event={event} />
      ))}
    </section>
  );
}
