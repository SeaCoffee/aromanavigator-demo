'use client';

import { useActionState } from 'react';

import { submitFeedbackAction } from '@/app/actions/siteContentActions';
import {
  actionResultMessage,
  isSuccessMessage,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';

export default function FeedbackForm({ sourcePath = '/contacts' }: { sourcePath?: string }) {
  const [state, action, pending] = useActionState(submitFeedbackAction, null);
  const message = state ? actionResultMessage(state) : '';

  return (
    <form action={action} className="grid gap-4 rounded-3xl border border-[#eadfd3] bg-white p-5 shadow-sm sm:p-7">
      <input name="source_path" type="hidden" value={sourcePath} />
      <label className="hidden" aria-hidden="true">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium">
          Р†РјвЂ™СЏ
          <input className="rounded-xl border border-[#ddcfc2] px-3 py-2.5" maxLength={120} name="name" required />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Email
          <input className="rounded-xl border border-[#ddcfc2] px-3 py-2.5" name="email" required type="email" />
        </label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium">
        РўРµРјР°
        <input className="rounded-xl border border-[#ddcfc2] px-3 py-2.5" maxLength={180} name="subject" required />
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        РџРѕРІС–РґРѕРјР»РµРЅРЅСЏ
        <textarea className="min-h-36 resize-y rounded-xl border border-[#ddcfc2] px-3 py-2.5" maxLength={5000} name="message" required />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button className="rounded-xl bg-[#7a5138] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#63412d] disabled:opacity-60" disabled={pending} type="submit">
          {pending ? 'РќР°РґСЃРёР»Р°РЅРЅСЏвЂ¦' : 'РќР°РґС–СЃР»Р°С‚Рё'}
        </button>
        {message ? (
          <p className={isSuccessMessage(message) ? 'text-sm text-emerald-700' : 'text-sm text-red-700'}>
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
