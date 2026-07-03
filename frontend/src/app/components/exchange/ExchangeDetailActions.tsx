'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import { useState, useTransition } from 'react';

import {
  acceptExchangeAction,
  rejectExchangeAction,
} from '@/app/actions/exchangeActions';

import type {
  ExchangeItemPayload,
  ExchangeStatus,
} from '@/app/types/exchangeTypes';
import { stringifyJson } from '@/app/utils/valueUtils';

type Props = {
  proposalId: number;
  status: ExchangeStatus;
  isOwner: boolean;
  isProposer: boolean;
  offered: ExchangeItemPayload[];
};

function buildDecisionFormData(
  proposalId: number,
  note: string,
  offered?: ExchangeItemPayload[],
) {
  const formData = new FormData();
  formData.set('id', String(proposalId));
  formData.set('decision_note', note);

  if (offered) {
    formData.set('accepted_items', stringifyJson(offered));
  }

  return formData;
}

export default function ExchangeDetailActions({
  proposalId,
  status,
  isOwner,
  offered,
}: Props) {
  const [note, setNote] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, startTransition] = useTransition();

  if (status !== 'pending') {
    return (
      <div className="mt-4 text-sm text-gray-500">
        Р С–С€РµРЅРЅСЏ РІР¶Рµ РїСЂРёР№РЅСЏС‚Рѕ.
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="mt-4 text-sm text-gray-500">
        Р’Рё РЅРµ РјРѕР¶РµС‚Рµ РєРµСЂСѓРІР°С‚Рё С†РёРј РѕР±РјС–РЅРѕРј.
      </div>
    );
  }

  const handleAccept = () => {
    setMessage(null);

    startTransition(async () => {
      const result = await acceptExchangeAction(
        null,
        buildDecisionFormData(proposalId, note, offered),
      );
      setMessage(result.msg ?? null);
    });
  };

  const handleReject = () => {
    setMessage(null);

    startTransition(async () => {
      const result = await rejectExchangeAction(
        null,
        buildDecisionFormData(proposalId, note),
      );
      setMessage(result.msg ?? null);
    });
  };

  return (
    <div className="mt-6 space-y-3">
      <textarea
        className="w-full rounded-md border p-2 text-sm"
        placeholder="РљРѕРјРµРЅС‚Р°СЂ"
        value={note}
        onChange={(event) => setNote(event.target.value)}
      />

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleAccept}
          disabled={loading}
          className={`${buttonStyles.primary}`}
        >
          {loading ? '...' : 'РџСЂРёР№РЅСЏС‚Рё'}
        </button>

        <button
          type="button"
          onClick={handleReject}
          disabled={loading}
          className={`${buttonStyles.danger}`}
        >
          {loading ? '...' : 'Р’С–РґС…РёР»РёС‚Рё'}
        </button>
      </div>

      {message ? <div className="text-sm text-gray-600">{message}</div> : null}
    </div>
  );
}
