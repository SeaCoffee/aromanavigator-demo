'use client';

import { useActionState } from 'react';

import { updateFeedbackAction } from '@/app/actions/siteContentActions';
import {
  actionResultMessage,
  isSuccessMessage,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';
import type { FeedbackMessage } from '@/app/types/siteContentTypes';

export default function AdminFeedbackUpdateForm({ item }: { item: FeedbackMessage }) {
  const [state, action, pending] = useActionState(updateFeedbackAction, null);
  const message = state ? actionResultMessage(state) : '';

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-[#dfe6e8] bg-white p-5">
      <input name="id" type="hidden" value={item.id} />
      <label className="grid gap-1 text-sm font-medium">
        РЎС‚Р°С‚СѓСЃ
        <select className="rounded-xl border border-[#cdd8dc] px-3 py-2.5" defaultValue={item.status} name="status">
          <option value="new">РќРѕРІРµ</option>
          <option value="in_progress">Р’ СЂРѕР±РѕС‚С–</option>
          <option value="resolved">Р’РёСЂС–С€РµРЅРѕ</option>
          <option value="spam">РЎРїР°Рј</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Р’РЅСѓС‚СЂС–С€РЅСЏ РїСЂРёРјС–С‚РєР°
        <textarea className="min-h-32 rounded-xl border border-[#cdd8dc] px-3 py-2.5" defaultValue={item.admin_note} name="admin_note" />
      </label>
      <button className="w-fit rounded-xl bg-[#344a52] px-4 py-2 text-sm font-semibold text-white" disabled={pending}>
        {pending ? 'Р—Р±РµСЂРµР¶РµРЅРЅСЏвЂ¦' : 'Р—Р±РµСЂРµРіС‚Рё'}
      </button>
      {message ? <p className={isSuccessMessage(message) ? 'text-sm text-emerald-700' : 'text-sm text-red-700'}>{message}</p> : null}
    </form>
  );
}
