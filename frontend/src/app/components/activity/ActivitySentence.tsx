import Link from 'next/link';

import {
  getActivityActorHref,
  getActivityActorLabel,
  getActivityTargetHref,
  getActivityTargetLabel,
  getActivityVerbLabel,
} from '@/app/components/activity/activityFormatters';
import { activityStyles } from '@/app/components/activity/activityStyles';
import type { ActivityEvent } from '@/app/types/activityTypes';

type Props = {
  event: ActivityEvent;
};

export default function ActivitySentence({ event }: Props) {
  const actorLabel = getActivityActorLabel(event.actor);
  const actorHref = getActivityActorHref(event.actor);

  const verbLabel = getActivityVerbLabel(event.verb);

  const targetLabel = getActivityTargetLabel(event.target, event.payload);
  const targetHref = getActivityTargetHref(event);

  return (
    <p className={activityStyles.text}>
      {actorHref ? (
        <Link href={actorHref} className={activityStyles.inlineLink}>
          {actorLabel}
        </Link>
      ) : (
        <span className={activityStyles.actor}>{actorLabel}</span>
      )}

      <span> {verbLabel}</span>

      {targetLabel ? (
        <>
          <span>: </span>

          {targetHref ? (
            <Link href={targetHref} className={activityStyles.inlineLink}>
              {targetLabel}
            </Link>
          ) : (
            <span>{targetLabel}</span>
          )}
        </>
      ) : null}
    </p>
  );
}
