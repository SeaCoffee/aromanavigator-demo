import ActivitySentence from '@/app/components/activity/ActivitySentence';
import {
  formatActivityDate,
  getActivityPayloadText,
  shouldShowActivityPayload,
} from '@/app/components/activity/activityFormatters';
import { activityStyles } from '@/app/components/activity/activityStyles';
import type { ActivityEvent } from '@/app/types/activityTypes';

type Props = {
  event: ActivityEvent;
};

const SHOW_DEBUG_PAYLOAD = false;

export default function ActivityEventCard({ event }: Props) {
  const payloadText = getActivityPayloadText(event);

  return (
    <article className={activityStyles.card}>
      <div className={activityStyles.cardTop}>
        <div className="min-w-0">
          <ActivitySentence event={event} />

          <p className={activityStyles.meta}>
            {formatActivityDate(event.created_at)}
            {event.is_private ? ' В· РїСЂРёРІР°С‚РЅРѕ' : ''}
          </p>
        </div>
      </div>

      {shouldShowActivityPayload(event) ? (
        <div className={activityStyles.payload}>{payloadText}</div>
      ) : null}

      {SHOW_DEBUG_PAYLOAD && Object.keys(event.payload ?? {}).length > 0 ? (
        <details className="text-xs text-gray-500">
          <summary>debug payload</summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-gray-50 p-3">
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        </details>
      ) : null}
    </article>
  );
}
