'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';

import { setFragranceAddRequestStatusAction } from '@/app/actions/fragranceUgcActions';
import {
  actionResultMessage,
  isSuccessMessage,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';
import {
  fragranceAdminLabels as labels,
  moderationStatusLabels,
} from '@/app/components/fragrances/fragranceAdminLabels';
import {
  fragranceAdminStyles as styles,
  messageClassName,
} from '@/app/components/fragrances/fragranceAdmin.styles';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { fragranceUgcPageUrlBuilder } from '@/app/urls/pageUrls/fragranceUgcPageUrlBuilder';

import type {
  FragranceAddRequest,
  ModerationStatus,
} from '@/app/types/fragranceTypes';

type FragranceAddRequestsAdminTableProps = {
  items: FragranceAddRequest[];
};

type RowState = {
  status: ModerationStatus;
  moderator_comment: string;
};

const QUICK_STATUS_OPTIONS: ModerationStatus[] = ['pending', 'rejected'];

function getStatusBadgeClass(status: ModerationStatus) {
  if (status === 'approved') {
    return 'bg-green-100 text-green-800';
  }

  if (status === 'rejected') {
    return 'bg-red-100 text-red-800';
  }

  return 'bg-amber-100 text-amber-800';
}

function getRequestTitle(item: FragranceAddRequest) {
  return `${item.brand_name} / ${item.fragrance_name}`;
}

function getCreatedFragranceLabel(item: FragranceAddRequest) {
  if (!item.created_fragrance) return null;

  const year = item.created_fragrance.release_year
    ? `, ${item.created_fragrance.release_year}`
    : '';

  return `${item.created_fragrance.brand.name} - ${item.created_fragrance.name}${year}`;
}

export default function FragranceAddRequestsAdminTable({
  items,
}: FragranceAddRequestsAdminTableProps) {
  const [displayItems, setDisplayItems] = useState(items);

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

  useEffect(() => {
    setDisplayItems(items);
    setRows(
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
  }, [items]);

  const patchRow = (
    id: FragranceAddRequest['id'],
    patch: Partial<RowState>,
  ) => {
    setRows((current) => ({
      ...current,
      [String(id)]: {
        ...current[String(id)],
        ...patch,
      },
    }));
  };

  const handleSave = (item: FragranceAddRequest) => {
    const row = rows[String(item.id)];
    if (!row) return;

    if (item.status === 'approved' || row.status === 'approved') {
      setMessages((current) => ({
        ...current,
        [String(item.id)]:
          labels.cannotChangeApprovedQuick,
      }));
      return;
    }

    const formData = new FormData();
    formData.set('id', String(item.id));
    formData.set('status', row.status);
    formData.set('moderator_comment', row.moderator_comment);

    startTransition(() => {
      void (async () => {
        const result = await setFragranceAddRequestStatusAction(null, formData);

        setMessages((current) => ({
          ...current,
          [String(item.id)]: actionResultMessage(result),
        }));

        if (result.ok) {
          setDisplayItems((current) =>
            current.map((currentItem) =>
              String(currentItem.id) === String(item.id)
                ? {
                    ...currentItem,
                    status: row.status,
                    moderator_comment: row.moderator_comment,
                  }
                : currentItem,
            ),
          );
        }
      })();
    });
  };

  if (displayItems.length === 0) {
    return (
      <div className={styles.emptyState}>{labels.noAddRequests}</div>
    );
  }

  return (
    <div className="grid gap-5">
      {displayItems.map((item) => {
        const row = rows[String(item.id)] ?? {
          status: item.status,
          moderator_comment: item.moderator_comment || '',
        };

        const message = messages[String(item.id)];
        const createdFragranceLabel = getCreatedFragranceLabel(item);
        const isApproved = item.status === 'approved';

        return (
          <section
            key={item.id}
            className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm"
          >
            <header className="flex flex-col gap-2 border-b border-neutral-200 bg-neutral-50 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <h2 className="min-w-0 text-lg font-semibold leading-snug text-neutral-950">
                  {getRequestTitle(item)}
                </h2>

                <span
                  className={`${styles.badge} ${getStatusBadgeClass(
                    item.status,
                  )}`}
                >
                  {moderationStatusLabels[item.status]}
                </span>
              </div>

              <span className={styles.mutedTiny}>
                {labels.userId(item.created_by_id)}
              </span>
            </header>

            <div className="grid gap-5 p-4">
            <div className="grid gap-3 text-sm md:grid-cols-3">
              <div>
                <div className="text-xs font-medium uppercase text-neutral-500">
                  {labels.year}
                </div>
                <div className="mt-1 text-neutral-950">{item.release_year ?? '-'}</div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase text-neutral-500">
                  {labels.perfumers}
                </div>
                <div className="mt-1 text-neutral-950">{item.perfumers_text || '-'}</div>
              </div>

              <div>
                <div className="text-xs font-medium uppercase text-neutral-500">
                  {labels.families}
                </div>
                <div className="mt-1 text-neutral-950">{item.families_text || '-'}</div>
              </div>

              {createdFragranceLabel ? (
                <div className="flex flex-wrap items-center gap-2 md:col-span-3">
                  <span>
                    <span className="font-medium">{labels.createdFragrance}:</span>{' '}
                    {createdFragranceLabel}
                  </span>

                  {item.created_fragrance_id ? (
                    <Link
                      href={fragrancePageUrlBuilder.admin.editFragrance(
                        item.created_fragrance_id,
                      )}
                      className={`${buttonStyles.compactSecondary}`}
                    >
                      {labels.edit}
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="grid gap-2">
                <div className="text-sm font-medium">{labels.notes}</div>
                <pre className="min-h-12 whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 font-sans text-sm text-neutral-700">
                  {item.notes_text || '-'}
                </pre>
              </div>

              <div className="grid gap-2">
                <div className="text-sm font-medium">{labels.links}</div>
                <pre className="min-h-12 whitespace-pre-wrap rounded-lg bg-neutral-50 p-3 font-sans text-sm text-neutral-700">
                  {item.links_text || '-'}
                </pre>
              </div>
            </div>

            {isApproved ? (
              <div className="flex flex-wrap items-center gap-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                <span>
                  {labels.approvedNotice}
                </span>

                <Link
                  href={fragranceUgcPageUrlBuilder.admin.addRequestDetail(
                    item.id,
                  )}
                  className={`${buttonStyles.primary}`}
                >
                  {labels.viewModeration}
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 lg:grid-cols-[220px_minmax(0,1fr)]">
                <label className="grid gap-1">
                  <span className="text-sm font-medium">{labels.quickStatus}</span>
                  <select
                    className="min-h-11 rounded-lg border border-neutral-300 bg-white px-3 py-2"
                    value={row.status}
                    onChange={(event) =>
                      patchRow(item.id, {
                        status: event.target.value as ModerationStatus,
                      })
                    }
                    disabled={isPending}
                  >
                    {QUICK_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {moderationStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-neutral-500">
                    {labels.quickStatusHint}
                  </span>
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium">
                    {labels.moderatorComment}
                  </span>
                  <textarea
                    className="min-h-24 w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2"
                    value={row.moderator_comment}
                    onChange={(event) =>
                      patchRow(item.id, {
                        moderator_comment: event.target.value,
                      })
                    }
                    disabled={isPending}
                  />
                </label>

                <div className="flex flex-wrap justify-end gap-2 lg:col-span-2">
                  <button
                    type="button"
                    className={`${buttonStyles.primary}`}
                    onClick={() => handleSave(item)}
                    disabled={isPending}
                  >
                    {labels.save}
                  </button>

                  <Link
                    href={fragranceUgcPageUrlBuilder.admin.addRequestDetail(
                      item.id,
                    )}
                    className={`${buttonStyles.secondary}`}
                  >
                    {labels.moderate}
                  </Link>
                </div>
              </div>
            )}

            {message ? (
              <div
                className={messageClassName(isSuccessMessage(message))}
              >
                {message}
              </div>
            ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
