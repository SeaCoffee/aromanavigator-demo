// src/app/(private)/admin/users/components/InlineSuspendEditor.tsx
'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import React from 'react';
import { useMemo, useState } from 'react';
import { datetimeLocalToIso, nowMinDatetimeLocal } from '@/app/utils/datetime';

type Props = {
  onCancel: () => void;
  onSave: (payload: { until: string; reason?: string }) => Promise<void>;
};

export function InlineSuspendEditor({ onCancel, onSave }: Props) {
  const min = useMemo(() => nowMinDatetimeLocal(), []);
  const [untilLocal, setUntilLocal] = useState<string>(min);
  const [reason, setReason] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function handleSave() {
    setErr(null);
    setOk(null);

    if (!untilLocal) {
      setErr('Р’РєР°Р¶С–С‚СЊ РґР°С‚Сѓ Р№ С‡Р°СЃ.');
      return;
    }

    // РџРµСЂРµРІС–СЂСЏС”РјРѕ, С‰Рѕ РґР°С‚Р° Р·Р°РІРµСЂС€РµРЅРЅСЏ РІ РјР°Р№Р±СѓС‚РЅСЊРѕРјСѓ.
    const chosen = new Date(untilLocal).getTime();
    const now = Date.now();
    if (Number.isNaN(chosen)) {
      setErr('РќРµРєРѕСЂРµРєС‚РЅР° РґР°С‚Р° Р°Р±Рѕ С‡Р°СЃ.');
      return;
    }
    if (chosen <= now) {
      setErr('Р”Р°С‚Р° Р·Р°РІРµСЂС€РµРЅРЅСЏ РјР°С” Р±СѓС‚Рё РІ РјР°Р№Р±СѓС‚РЅСЊРѕРјСѓ.');
      return;
    }

    try {
      setBusy(true);
      const until = datetimeLocalToIso(untilLocal);
      await onSave({ until, reason: reason || undefined });
      setOk('Р—Р±РµСЂРµР¶РµРЅРѕ.');
    } catch (e: any) {
      setErr(e?.message ?? 'РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°СЃС‚РѕСЃСѓРІР°С‚Рё Р±Р»РѕРєСѓРІР°РЅРЅСЏ.');
    } finally {
      setBusy(false);
    }
  }

  return (
      <div data-testid="inline-suspend-editor" className="mt-2 border rounded p-2 space-y-2">
      {err && <div className="text-sm text-red-700">{err}</div>}
      {ok && <div className="text-sm text-green-700">{ok}</div>}

      <div className="flex flex-wrap gap-2 items-end">
        <label className="text-xs">
          <div className="text-gray-600 mb-1">Р”Рѕ</div>
          <input
            type="datetime-local"
            value={untilLocal}
            min={min}
            onChange={e => setUntilLocal(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </label>

        <label className="text-xs flex-1 min-w-[220px]">
          <div className="text-gray-600 mb-1">РџСЂРёС‡РёРЅР° (РЅРµРѕР±РѕРІКјСЏР·РєРѕРІРѕ)</div>
          <input
            type="text"
            value={reason}
            maxLength={255}
            onChange={e => setReason(e.target.value)}
            className="border px-2 py-1 rounded w-full"
            placeholder="РџСЂРёС‡РёРЅР°вЂ¦"
          />
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className={`${buttonStyles.compactSecondary}`}
          >
            Р—Р±РµСЂРµРіС‚Рё
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={`${buttonStyles.compactSecondary}`}
          >
            РЎРєР°СЃСѓРІР°С‚Рё
          </button>
        </div>
      </div>
    </div>
  );
}
