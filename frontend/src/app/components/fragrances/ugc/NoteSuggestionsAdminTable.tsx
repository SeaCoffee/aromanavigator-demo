'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import { useState, useTransition } from 'react';

import { setNoteSuggestionStatusAction } from '@/app/actions/fragranceUgcActions';
import {
  actionResultMessage,
  isSuccessMessage,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';
import {
  MODERATION_STATUS_OPTIONS,
  noteLevelLabel,
} from '@/app/utils/fragranceUgcComponentUtils';
import {
  fragranceAdminLabels as labels,
  moderationStatusLabels,
} from '@/app/components/fragrances/fragranceAdminLabels';
import {
  fragranceAdminStyles as styles,
  messageClassName,
} from '@/app/components/fragrances/fragranceAdmin.styles';

import type {
  ModerationStatus,
  NoteSuggestion,
} from '@/app/types/fragranceTypes';

type NoteSuggestionsAdminTableProps = {
  items: NoteSuggestion[];
};

type RowState = {
  status: ModerationStatus;
  moderator_comment: string;
};

export default function NoteSuggestionsAdminTable({
  items,
}: NoteSuggestionsAdminTableProps) {
  const [rows, setRows] = useState<Record<string, RowState>>(
    Object.fromEntries(
      items.map((item) => [
        String(item.id),
        {
          status: item.status,
          moderator_comment: item.moderator_comment || '',
        },
      ]),
    ),
  );
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const patchRow = (id: NoteSuggestion['id'], patch: Partial<RowState>) => {
    setRows((current) => ({
      ...current,
      [String(id)]: {
        ...current[String(id)],
        ...patch,
      },
    }));
  };

  const handleSave = (id: NoteSuggestion['id']) => {
    const row = rows[String(id)];
    if (!row) return;

    const formData = new FormData();
    formData.set('id', String(id));
    formData.set('status', row.status);
    formData.set('moderator_comment', row.moderator_comment);

    startTransition(() => {
      void (async () => {
        const result = await setNoteSuggestionStatusAction(null, formData);

        setMessages((current) => ({
          ...current,
          [String(id)]: actionResultMessage(result),
        }));
      })();
    });
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>{labels.noNoteSuggestions}</div>
    );
  }

  return (
    <div className={styles.section}>
      {items.map((item) => {
        const row = rows[String(item.id)];
        const message = messages[String(item.id)];

        return (
          <section key={item.id} className={styles.card}>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-semibold">
                {item.fragrance.brand.name} / {item.fragrance.name}: {item.note.name}
              </h2>
              <span className={styles.neutralBadge}>
                {noteLevelLabel(item.level)}
              </span>
              <span className={styles.neutralBadge}>
                {labels.score}: {item.score}
              </span>
              <span className={styles.neutralBadge}>
                {labels.status}: {moderationStatusLabels[item.status]}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-[220px_1fr_auto] md:items-start">
              <label className="grid gap-1">
                <span className="text-sm font-medium">{labels.status}</span>
                <select
                  className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2"
                  value={row?.status ?? item.status}
                  onChange={(event) =>
                    patchRow(item.id, {
                      status: event.target.value as ModerationStatus,
                    })
                  }
                  disabled={isPending}
                >
                  {MODERATION_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {moderationStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium">{labels.moderatorComment}</span>
                <textarea
                  className="min-h-24 rounded-lg border border-neutral-300 px-3 py-2"
                  value={row?.moderator_comment ?? ''}
                  onChange={(event) =>
                    patchRow(item.id, {
                      moderator_comment: event.target.value,
                    })
                  }
                  disabled={isPending}
                />
              </label>

              <div className="pt-6">
                <button
                  type="button"
                  className={`${buttonStyles.secondary}`}
                  onClick={() => handleSave(item.id)}
                  disabled={isPending}
                >
                  {labels.save}
                </button>
              </div>
            </div>

            {message ? (
              <div
                className={messageClassName(isSuccessMessage(message))}
              >
                {message}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
