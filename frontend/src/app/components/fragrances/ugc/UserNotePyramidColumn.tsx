'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import type {
  NoteSuggestion,
  VoteInput,
} from '@/app/types/fragranceTypes';

type UserNotePyramidColumnProps = {
  title: string;
  items: NoteSuggestion[];
  onVote: (suggestionId: NoteSuggestion['id'], value: VoteInput['value']) => void;
  isVoting: boolean;
  canInteract?: boolean;
};

export default function UserNotePyramidColumn({
  title,
  items,
  onVote,
  isVoting,
  canInteract = true,
}: UserNotePyramidColumnProps) {
  return (
    <div className="rounded-lg bg-neutral-50 p-3">
      <div className="mb-3 text-sm font-medium">{title}</div>

      {items.length === 0 ? (
        <div className="text-sm text-neutral-500">РџСЂРѕРїРѕР·РёС†С–Р№ С‰Рµ РЅРµРјР°С”.</div>
      ) : null}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-neutral-200 bg-white p-3"
          >
            <div className="font-medium">{item.note.name}</div>

            <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-500">
              <span>РћС†С–РЅРєР°: {item.score}</span>
              {item.status === 'pending' ? <span>РћС‡С–РєСѓС” РјРѕРґРµСЂР°С†С–С—</span> : null}
            </div>

            {item.moderator_comment ? (
              <div className="mt-2 text-sm text-neutral-700">
                РњРѕРґРµСЂР°С‚РѕСЂ: {item.moderator_comment}
              </div>
            ) : null}

            {canInteract ? <div className="mt-3 flex gap-2">
              <button
                type="button"
                className={`${buttonStyles.compactSecondary}`}
                onClick={() => onVote(item.id, 1)}
                disabled={isVoting}
              >
                +1
              </button>

              <button
                type="button"
                className={`${buttonStyles.compactSecondary}`}
                onClick={() => onVote(item.id, -1)}
                disabled={isVoting}
              >
                -1
              </button>
            </div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
