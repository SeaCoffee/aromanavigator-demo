'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import { useId, useState, useTransition } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';

import {
  adminSuspendUserAction,
  adminUnsuspendUserAction,
} from '@/app/actions/usersActions';
import FormMessage from '@/app/components/auth/FormMessage';
import type { ActionMessage } from '@/app/types/authTypes';
import type {
  AdminUserListItem,
  SuspendUserPayload,
} from '@/app/types/userTypes';
import { formatDateTime } from '@/app/utils/dateFormatUtils';
import { firstStringMessage, recordMessage } from '@/app/utils/messageUtils';

type Props = {
  user: AdminUserListItem;
};

type FormValues = {
  permanent: boolean;
  until: string;
  reason: string;
};

function applyFieldErrors(
  msg: ActionMessage,
  setError: UseFormSetError<FormValues>,
): boolean {
  const record = recordMessage(msg);

  if (!record) {
    return false;
  }

  let hasFieldError = false;

  const fields: Array<keyof FormValues> = ['until', 'permanent', 'reason'];

  fields.forEach((field) => {
    const fieldError = firstStringMessage(record[field]);

    if (fieldError) {
      setError(field, {
        type: 'server',
        message: fieldError,
      });
      hasFieldError = true;
    }
  });

  return hasFieldError;
}

function toPayload(values: FormValues): SuspendUserPayload {
  if (values.permanent) {
    return {
      permanent: true,
      until: null,
      reason: values.reason.trim(),
    };
  }

  return {
    permanent: false,
    until: values.until ? new Date(values.until).toISOString() : null,
    reason: values.reason.trim(),
  };
}

export default function AdminUserSuspensionForm({ user }: Props) {
  const baseId = useId();

  const permanentId = `${baseId}-permanent`;
  const untilId = `${baseId}-until`;
  const reasonId = `${baseId}-reason`;

  const [message, setMessage] = useState<ActionMessage>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      permanent: false,
      until: '',
      reason: user.suspended_reason ?? '',
    },
  });

  const permanent = watch('permanent');

  function onSubmit(values: FormValues) {
    setMessage('');
    setIsSuccess(false);

    startTransition(async () => {
      const result = await adminSuspendUserAction(user.id, toPayload(values));

      setIsSuccess(result.ok);

      if (result.ok) {
        setMessage(result.msg ?? 'РљРѕСЂРёСЃС‚СѓРІР°С‡Р° Р·Р°Р±Р»РѕРєРѕРІР°РЅРѕ.');
        reset({
          permanent: false,
          until: '',
          reason: values.reason,
        });
        return;
      }

      const wasFieldError = applyFieldErrors(result.msg, setError);

      if (!wasFieldError) {
        setMessage(result.msg);
      }
    });
  }

  function unsuspend() {
    setMessage('');
    setIsSuccess(false);

    startTransition(async () => {
      const result = await adminUnsuspendUserAction(user.id);

      setIsSuccess(result.ok);
      setMessage(result.msg ?? '');
    });
  }

  return (
    <section className="grid content-start gap-4 rounded-2xl border p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">РћР±РјРµР¶РµРЅРЅСЏ Р°РєР°СѓРЅС‚Р°</h2>
        <p className="mt-1 text-sm text-gray-500">
          РўРёРјС‡Р°СЃРѕРІРѕ Р°Р±Рѕ Р±РµР·СЃС‚СЂРѕРєРѕРІРѕ Р·Р°Р±РѕСЂРѕРЅСЏС” РґС–С— РєРѕСЂРёСЃС‚СѓРІР°С‡Р°, Р°Р»Рµ РЅРµ РІРёРґР°Р»СЏС” Р°РєР°СѓРЅС‚.
        </p>
      </div>

      <div className="rounded-lg bg-gray-50 p-3 text-sm">
        {user.is_suspended ? (
          <div className="grid gap-1">
            <p className="font-medium text-red-700">Р”С–С— Р°РєР°СѓРЅС‚Р° РѕР±РјРµР¶РµРЅС–</p>
            <p className="text-gray-600">
              {user.suspended_indefinitely
                ? 'Р‘РµР·СЃС‚СЂРѕРєРѕРІРѕ'
                : `Р”Рѕ ${formatDateTime(user.suspended_until)}`}
            </p>
            {user.suspended_reason ? (
              <p className="text-gray-600">РџСЂРёС‡РёРЅР°: {user.suspended_reason}</p>
            ) : null}
          </div>
        ) : (
          <p className="text-gray-600">РћР±РјРµР¶РµРЅСЊ Р°РєР°СѓРЅС‚Р° РЅРµРјР°С”.</p>
        )}
      </div>

      <FormMessage message={message} ok={isSuccess} />

      {user.is_suspended ? (
        <button
          type="button"
          disabled={isPending}
          onClick={unsuspend}
          className={`${buttonStyles.secondary}`}
        >
          {isPending ? 'Р РѕР·Р±Р»РѕРєСѓРІР°РЅРЅСЏ...' : 'Р РѕР·Р±Р»РѕРєСѓРІР°С‚Рё'}
        </button>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
        <label htmlFor={permanentId} className="flex items-center gap-2 text-sm">
          <input
            id={permanentId}
            type="checkbox"
            {...register('permanent')}
          />
          Р‘РµР·СЃС‚СЂРѕРєРѕРІРµ РѕР±РјРµР¶РµРЅРЅСЏ
        </label>

        <div className="grid gap-1">
          <label htmlFor={untilId} className="text-sm font-medium">
            РћР±РјРµР¶РёС‚Рё РґРѕ
          </label>

          <input
            id={untilId}
            type="datetime-local"
            disabled={permanent}
            {...register('until', {
              validate: (value, values) => {
                if (values.permanent) return true;
              return Boolean(value) || 'Р’РєР°Р¶С–С‚СЊ РґР°С‚Сѓ Р°Р±Рѕ РѕР±РµСЂС–С‚СЊ Р±РµР·СЃС‚СЂРѕРєРѕРІРµ РѕР±РјРµР¶РµРЅРЅСЏ.';
              },
            })}
            className="rounded-lg border px-3 py-2 disabled:bg-gray-100"
          />

          {errors.until?.message ? (
            <span className="text-sm text-red-600">{errors.until.message}</span>
          ) : null}
        </div>

        <div className="grid gap-1">
          <label htmlFor={reasonId} className="text-sm font-medium">
            РџСЂРёС‡РёРЅР°
          </label>

          <textarea
            id={reasonId}
            rows={4}
            {...register('reason', {
              maxLength: {
                value: 255,
                message: 'РџСЂРёС‡РёРЅР° РјР°С” Р±СѓС‚Рё РЅРµ РґРѕРІС€Рµ 255 СЃРёРјРІРѕР»С–РІ.',
              },
            })}
            className="resize-y rounded-lg border px-3 py-2"
          />

          {errors.reason?.message ? (
            <span className="text-sm text-red-600">{errors.reason.message}</span>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isPending || !isValid}
          className={`${buttonStyles.primary}`}
        >
          {isPending ? 'Р—Р±РµСЂРµР¶РµРЅРЅСЏ...' : 'Р—Р°СЃС‚РѕСЃСѓРІР°С‚Рё РѕР±РјРµР¶РµРЅРЅСЏ'}
        </button>
      </form>
    </section>
  );
}
