'use client';

import { useActionState } from 'react';

import { createNotificationAnnouncementAction } from '@/app/actions/notificationActions';
import { notificationAnnouncementKindOptions } from '@/app/components/notifications/notificationAnnouncementOptions';
import { notificationStyles } from '@/app/components/notifications/notificationStyles';

const initialState = null;

export default function AdminNotificationAnnouncementForm() {
  const [state, formAction, isPending] = useActionState(
    createNotificationAnnouncementAction,
    initialState,
  );

  return (
    <form action={formAction} className={notificationStyles.adminForm}>
      <div className={notificationStyles.adminFormGrid}>
        <label className={notificationStyles.field}>
          <span className={notificationStyles.label}>РўРёРї</span>
          <select name="kind" className={notificationStyles.input} defaultValue="other">
            {notificationAnnouncementKindOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={notificationStyles.field}>
          <span className={notificationStyles.label}>РЎС‚Р°СЂС‚ РїРѕРєР°Р·Сѓ</span>
          <input name="starts_at" type="datetime-local" className={notificationStyles.input} />
        </label>

        <label className={notificationStyles.field}>
          <span className={notificationStyles.label}>Р—Р°РІРµСЂС€РµРЅРЅСЏ</span>
          <input name="ends_at" type="datetime-local" className={notificationStyles.input} />
        </label>
      </div>

      <label className={notificationStyles.field}>
        <span className={notificationStyles.label}>Р—Р°РіРѕР»РѕРІРѕРє</span>
        <input
          name="title"
          required
          maxLength={180}
          className={notificationStyles.input}
        />
      </label>

      <label className={notificationStyles.field}>
        <span className={notificationStyles.label}>РўРµРєСЃС‚ РѕРіРѕР»РѕС€РµРЅРЅСЏ</span>
        <textarea
          name="body"
          required
          maxLength={2000}
          rows={5}
          className={notificationStyles.textarea}
        />
      </label>

      <label className={notificationStyles.checkboxLabel}>
        <input name="is_active" type="checkbox" defaultChecked />
        <span>РђРєС‚РёРІРЅРµ</span>
      </label>

      <div className={notificationStyles.actions}>
        <button type="submit" disabled={isPending} className={notificationStyles.button}>
          {isPending ? 'РЎС‚РІРѕСЂРµРЅРЅСЏ...' : 'РЎС‚РІРѕСЂРёС‚Рё РѕРіРѕР»РѕС€РµРЅРЅСЏ'}
        </button>
      </div>

      {state?.msg ? (
        <p className={state.ok ? notificationStyles.success : notificationStyles.error}>
          {state.msg}
        </p>
      ) : null}
    </form>
  );
}
