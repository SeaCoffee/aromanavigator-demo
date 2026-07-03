'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  acceptExchangeAction,
  cancelExchangeAction,
  rejectExchangeAction,
  type ExchangeActionResult,
} from '@/app/actions/exchangeActions';
import type { ExchangeItemPayload, ExchangeProposal } from '@/app/types/exchangeTypes';
import { exchangeStyles } from '@/app/components/exchange/exchangeStyles';
import { formatExchangeItems } from '@/app/components/exchange/exchangeHelpers';
import { stringifyJson } from '@/app/utils/valueUtils';

type Props = {
  proposal: ExchangeProposal;
  mode: 'owner' | 'proposer' | 'viewer';
};

type DecisionFormValues = {
  decision_note: string;
};

function buildDecisionFormData(params: {
  id: number;
  decisionNote: string;
  acceptedItems?: ExchangeItemPayload[];
}): FormData {
  const formData = new FormData();

  formData.set('id', String(params.id));
  formData.set('decision_note', params.decisionNote.trim());

  if (params.acceptedItems) {
    formData.set('accepted_items', stringifyJson(params.acceptedItems));
  }

  return formData;
}

function ActionMessage({ result }: { result: ExchangeActionResult | null }) {
  if (!result?.msg) return null;

  return (
    <p className={result.ok ? exchangeStyles.success : exchangeStyles.error}>
      {result.msg}
    </p>
  );
}

function AcceptExchangeForm({ proposal }: { proposal: ExchangeProposal }) {
  const [result, setResult] = useState<ExchangeActionResult | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DecisionFormValues>({
    defaultValues: {
      decision_note: '',
    },
  });

  async function onSubmit(values: DecisionFormValues) {
    setResult(null);

    if (proposal.offer_all) {
      setError('decision_note', {
        type: 'manual',
        message: 'Р”Р»СЏ С†С–С”С— РїСЂРѕРїРѕР·РёС†С–С— РїРѕС‚СЂС–Р±РЅРѕ СЃРїРѕС‡Р°С‚РєСѓ РѕР±СЂР°С‚Рё РїРѕР·РёС†С–С— Сѓ РІС–РґРїСЂР°РІРЅРёРєР°.',
      });

      return;
    }

    const formData = buildDecisionFormData({
      id: proposal.id,
      decisionNote: values.decision_note,
      acceptedItems: proposal.offered_items,
    });

    const actionResult = await acceptExchangeAction(null, formData);
    setResult(actionResult);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-3 rounded-2xl border border-gray-200 p-4"
    >
      <div>
        <h2 className="text-base font-semibold text-gray-950">
          РџСЂРёР№РЅСЏС‚Рё РїСЂРѕРїРѕР·РёС†С–СЋ
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Р”Рѕ РїСЂРёР№РЅСЏС‚С‚СЏ:{' '}
          {proposal.offer_all
            ? 'РїРѕС‚СЂС–Р±РЅРѕ РѕР±СЂР°С‚Рё РїРѕР·РёС†С–С— Сѓ РІС–РґРїСЂР°РІРЅРёРєР°'
            : formatExchangeItems(proposal.offered_items)}
        </p>
      </div>

      {proposal.offer_all ? (
        <p className={exchangeStyles.error}>
          Р”Р»СЏ РїСЂРѕРїРѕР·РёС†С–С— вЂњРѕР±СЂР°С‚Рё Р· СѓСЃСЊРѕРіРѕвЂќ РїРѕС‚СЂС–Р±РµРЅ РѕРєСЂРµРјРёР№ РІРёР±С–СЂ РїРѕР·РёС†С–Р№.
          РџРѕРєРё РїСЂРёР№РЅСЏС‚С‚СЏ РґРѕСЃС‚СѓРїРЅРµ С‚С–Р»СЊРєРё РґР»СЏ РєРѕРЅРєСЂРµС‚РЅРѕ Р·Р°РїСЂРѕРїРѕРЅРѕРІР°РЅРёС… РїРѕР·РёС†С–Р№.
        </p>
      ) : null}

      <textarea
        {...register('decision_note')}
        className={exchangeStyles.textarea}
        placeholder="РљРѕРјРµРЅС‚Р°СЂ РґРѕ СЂС–С€РµРЅРЅСЏ. РЇРєС‰Рѕ С” РґРѕРїР»Р°С‚Р° Р°Р±Рѕ С–РЅС€С– РЅСЋР°РЅСЃРё вЂ” РІРєР°Р¶С–С‚СЊ С‚СѓС‚."
      />

      {errors.decision_note?.message ? (
        <p className={exchangeStyles.error}>{errors.decision_note.message}</p>
      ) : null}

      <ActionMessage result={result} />

      <button
        type="submit"
        disabled={isSubmitting || proposal.offer_all}
        className={`${exchangeStyles.button} ${exchangeStyles.buttonPrimary}`}
      >
        {isSubmitting ? 'РџСЂРёР№РјР°С”РјРѕ...' : 'РџСЂРёР№РЅСЏС‚Рё'}
      </button>
    </form>
  );
}

function RejectExchangeForm({ proposal }: { proposal: ExchangeProposal }) {
  const [result, setResult] = useState<ExchangeActionResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<DecisionFormValues>({
    defaultValues: {
      decision_note: '',
    },
  });

  async function onSubmit(values: DecisionFormValues) {
    setResult(null);

    const formData = buildDecisionFormData({
      id: proposal.id,
      decisionNote: values.decision_note,
    });

    const actionResult = await rejectExchangeAction(null, formData);
    setResult(actionResult);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-3 rounded-2xl border border-gray-200 p-4"
    >
      <div>
        <h2 className="text-base font-semibold text-gray-950">
          Р’С–РґС…РёР»РёС‚Рё РїСЂРѕРїРѕР·РёС†С–СЋ
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          РњРѕР¶РЅР° Р·Р°Р»РёС€РёС‚Рё РєРѕСЂРѕС‚РєРёР№ РєРѕРјРµРЅС‚Р°СЂ РґР»СЏ РІС–РґРїСЂР°РІРЅРёРєР°.
        </p>
      </div>

      <textarea
        {...register('decision_note')}
        className={exchangeStyles.textarea}
        placeholder="РџСЂРёС‡РёРЅР° РІС–РґС…РёР»РµРЅРЅСЏ Р°Р±Рѕ РєРѕРјРµРЅС‚Р°СЂ."
      />

      <ActionMessage result={result} />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`${exchangeStyles.button} ${exchangeStyles.buttonDanger}`}
      >
        {isSubmitting ? 'Р’С–РґС…РёР»СЏС”РјРѕ...' : 'Р’С–РґС…РёР»РёС‚Рё'}
      </button>
    </form>
  );
}

function CancelExchangeForm({ proposal }: { proposal: ExchangeProposal }) {
  const [result, setResult] = useState<ExchangeActionResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<DecisionFormValues>({
    defaultValues: {
      decision_note: '',
    },
  });

  async function onSubmit(values: DecisionFormValues) {
    setResult(null);

    const formData = buildDecisionFormData({
      id: proposal.id,
      decisionNote: values.decision_note,
    });

    const actionResult = await cancelExchangeAction(null, formData);
    setResult(actionResult);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-3 rounded-2xl border border-gray-200 p-4"
    >
      <div>
        <h2 className="text-base font-semibold text-gray-950">
          РЎРєР°СЃСѓРІР°С‚Рё РїСЂРѕРїРѕР·РёС†С–СЋ
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Р’Рё РјРѕР¶РµС‚Рµ СЃРєР°СЃСѓРІР°С‚Рё РїСЂРѕРїРѕР·РёС†С–СЋ, РїРѕРєРё РІРѕРЅР° РѕС‡С–РєСѓС” СЂС–С€РµРЅРЅСЏ.
        </p>
      </div>

      <textarea
        {...register('decision_note')}
        className={exchangeStyles.textarea}
        placeholder="РљРѕРјРµРЅС‚Р°СЂ РґРѕ СЃРєР°СЃСѓРІР°РЅРЅСЏ, СЏРєС‰Рѕ РїРѕС‚СЂС–Р±РЅРѕ."
      />

      <ActionMessage result={result} />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`${exchangeStyles.button} ${exchangeStyles.buttonDanger}`}
      >
        {isSubmitting ? 'РЎРєР°СЃРѕРІСѓС”РјРѕ...' : 'РЎРєР°СЃСѓРІР°С‚Рё'}
      </button>
    </form>
  );
}

export default function ExchangeDecisionForms({ proposal, mode }: Props) {
  if (proposal.status !== 'pending') return null;

  if (mode === 'owner') {
    return (
      <section className="grid gap-4">
        <AcceptExchangeForm proposal={proposal} />
        <RejectExchangeForm proposal={proposal} />
      </section>
    );
  }

  if (mode === 'proposer') {
    return <CancelExchangeForm proposal={proposal} />;
  }

  return null;
}
