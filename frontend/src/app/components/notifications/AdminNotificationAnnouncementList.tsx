'use client';

import { useActionState } from 'react';

import {
  deleteNotificationAnnouncementAction,
  updateNotificationAnnouncementAction,
} from '@/app/actions/notificationActions';
import { notificationAnnouncementKindOptions } from '@/app/components/notifications/notificationAnnouncementOptions';
import { formatNotificationDate } from '@/app/components/notifications/notificationFormatters';
import { notificationStyles } from '@/app/components/notifications/notificationStyles';
import type { NotificationAnnouncement } from '@/app/types/notificationTypes';

type Props = {
  announcements: NotificationAnnouncement[];
};

function toDateTimeLocal(value: string | null) {
  if (!value) return '';

  return value.slice(0, 16);
}

function AdminNotificationAnnouncementItem({
  announcement,
}: {
  announcement: NotificationAnnouncement;
}) {
  const [updateState, updateAction, isUpdating] = useActionState(
    updateNotificationAnnouncementAction,
    null,
  );
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteNotificationAnnouncementAction,
    null,
  );

  return (
    <article className={notificationStyles.card}>
      <div className={notificationStyles.cardTop}>
        <div>
          <p className={notificationStyles.meta}>
            {announcement.kind_label} В· {formatNotificationDate(announcement.created_at)}
          </p>
          <h2 className={notificationStyles.cardTitle}>{announcement.title}</h2>
        </div>

        <span
          className={
            announcement.is_active
              ? notificationStyles.badge
              : notificationStyles.readBadge
          }
        >
          {announcement.is_active ? 'РђРєС‚РёРІРЅРµ' : 'Р’РёРјРєРЅРµРЅРµ'}
        </span>
      </div>

      <form action={updateAction} className={notificationStyles.adminForm}>
        <input type="hidden" name="id" value={announcement.id} />

        <div className={notificationStyles.adminFormGrid}>
          <label className={notificationStyles.field}>
            <span className={notificationStyles.label}>РўРёРї</span>
            <select
              name="kind"
              className={notificationStyles.input}
              defaultValue={announcement.kind}
            >
              {notificationAnnouncementKindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className={notificationStyles.field}>
            <span className={notificationStyles.label}>РЎС‚Р°СЂС‚ РїРѕРєР°Р·Сѓ</span>
            <input
              name="starts_at"
              type="datetime-local"
              defaultValue={toDateTimeLocal(announcement.starts_at)}
              className={notificationStyles.input}
            />
          </label>

          <label className={notificationStyles.field}>
            <span className={notificationStyles.label}>Р—Р°РІРµСЂС€РµРЅРЅСЏ</span>
            <input
              name="ends_at"
              type="datetime-local"
              defaultValue={toDateTimeLocal(announcement.ends_at)}
              className={notificationStyles.input}
            />
          </label>
        </div>

        <label className={notificationStyles.field}>
          <span className={notificationStyles.label}>Р—Р°РіРѕР»РѕРІРѕРє</span>
          <input
            name="title"
            required
            maxLength={180}
            defaultValue={announcement.title}
            className={notificationStyles.input}
          />
        </label>

        <label className={notificationStyles.field}>
          <span className={notificationStyles.label}>РўРµРєСЃС‚</span>
          <textarea
            name="body"
            required
            maxLength={2000}
            rows={4}
            defaultValue={announcement.body}
            className={notificationStyles.textarea}
          />
        </label>

        <label className={notificationStyles.checkboxLabel}>
          <input name="is_active" type="checkbox" defaultChecked={announcement.is_active} />
          <span>РђРєС‚РёРІРЅРµ</span>
        </label>

        <div className={notificationStyles.actions}>
          <button
            type="submit"
            disabled={isUpdating}
            className={notificationStyles.button}
          >
            {isUpdating ? 'Р—Р±РµСЂРµР¶РµРЅРЅСЏ...' : 'Р—Р±РµСЂРµРіС‚Рё'}
          </button>
        </div>

        {updateState?.msg ? (
          <p className={updateState.ok ? notificationStyles.success : notificationStyles.error}>
            {updateState.msg}
          </p>
        ) : null}
      </form>

      <form action={deleteAction} className={notificationStyles.actions}>
        <input type="hidden" name="id" value={announcement.id} />
        <button
          type="submit"
          disabled={isDeleting}
          className={notificationStyles.dangerButton}
        >
          {isDeleting ? 'Р’РёРґР°Р»РµРЅРЅСЏ...' : 'Р’РёРґР°Р»РёС‚Рё'}
        </button>
      </form>

      {deleteState?.msg ? (
        <p className={deleteState.ok ? notificationStyles.success : notificationStyles.error}>
          {deleteState.msg}
        </p>
      ) : null}
    </article>
  );
}

export default function AdminNotificationAnnouncementList({
  announcements,
}: Props) {
  if (announcements.length === 0) {
    return (
      <section className={notificationStyles.emptyCard}>
        РћРіРѕР»РѕС€РµРЅСЊ РїРѕРєРё РЅРµРјР°С”.
      </section>
    );
  }

  return (
    <section className={notificationStyles.list}>
      {announcements.map((announcement) => (
        <AdminNotificationAnnouncementItem
          key={announcement.id}
          announcement={announcement}
        />
      ))}
    </section>
  );
}
