'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import {
  createWardrobeItemAction,
  updateWardrobeItemAction,
} from '@/app/actions/wardrobeActions';
import FragrancePicker from '@/app/components/wardrobe/FragrancePicker';
import { buttonStyles } from '@/app/components/common/buttonStyles';
import {
  WARDROBE_DEFAULT_STATUS,
  WARDROBE_STATUS_OPTIONS,
} from '@/app/components/wardrobe/wardrobeConstants';
import { messageToText } from '@/app/components/wardrobe/wardrobeMessages';
import type { FragranceListItem } from '@/app/types/fragranceTypes';
import type { ID } from '@/app/types/http';
import type {
  WardrobeCreatePayload,
  WardrobeItem,
  WardrobeStatus,
  WardrobeUpdatePayload,
} from '@/app/types/wardrobeTypes';
import { getApiErrorMessage } from '@/errors/ApiError';

type WardrobeFormValues = {
  fragrance_id: ID | '';
  status: WardrobeStatus;
  rating: number | '';
  notes: string;
  is_private: boolean;
};

type Props = {
  mode: 'create' | 'edit';
  initialItem?: WardrobeItem | null;
  initialFragrances?: FragranceListItem[];
  successHref?: string | null;
  successLinkLabel?: string;
};

function getDefaultValues(initialItem?: WardrobeItem | null): WardrobeFormValues {
  return {
    fragrance_id: initialItem?.fragrance.id ?? '',
    status: initialItem?.status ?? WARDROBE_DEFAULT_STATUS,
    rating: initialItem?.rating ?? '',
    notes: initialItem?.notes ?? '',
    is_private: initialItem?.is_private ?? false,
  };
}

function toPositiveId(value: ID | ''): ID {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('РћР±РµСЂС–С‚СЊ Р°СЂРѕРјР°С‚ Р· РµРЅС†РёРєР»РѕРїРµРґС–С—.');
  }

  return id;
}

function normalizeRating(value: number | ''): number | null {
  if (value === '') {
    return null;
  }

  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
    throw new Error('РћС†С–РЅРєР° РјР°С” Р±СѓС‚Рё РІС–Рґ 1 РґРѕ 10.');
  }

  return rating;
}

function normalizeCreatePayload(values: WardrobeFormValues): WardrobeCreatePayload {
  return {
    fragrance_id: toPositiveId(values.fragrance_id),
    status: values.status,
    rating: normalizeRating(values.rating),
    notes: values.notes,
    is_private: values.is_private,
  };
}

function normalizeUpdatePayload(values: WardrobeFormValues): WardrobeUpdatePayload {
  return {
    fragrance_id: toPositiveId(values.fragrance_id),
    status: values.status,
    rating: normalizeRating(values.rating),
    notes: values.notes,
    is_private: values.is_private,
  };
}

export default function WardrobeForm({
  mode,
  initialItem = null,
  initialFragrances = [],
  successHref = null,
  successLinkLabel = 'РџРѕРІРµСЂРЅСѓС‚РёСЃСЏ РґРѕ РіР°СЂРґРµСЂРѕР±Р°',
}: Props) {
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const options = useMemo(() => {
    if (!initialItem?.fragrance) {
      return initialFragrances;
    }

    const exists = initialFragrances.some((item) => {
      return String(item.id) === String(initialItem.fragrance.id);
    });

    return exists
      ? initialFragrances
      : [initialItem.fragrance, ...initialFragrances];
  }, [initialFragrances, initialItem]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<WardrobeFormValues>({
    defaultValues: getDefaultValues(initialItem),
  });

  const fragranceId = watch('fragrance_id');

  function onSubmit(values: WardrobeFormValues) {
    setMessage('');
    setIsSuccess(false);

    startTransition(async () => {
      try {
        const result =
          mode === 'edit' && initialItem
            ? await updateWardrobeItemAction(
                initialItem.id,
                normalizeUpdatePayload(values),
              )
            : await createWardrobeItemAction(normalizeCreatePayload(values));

        if (!result.ok) {
          setMessage(messageToText(result.msg));
          return;
        }

        setMessage(messageToText(result.msg));
        setIsSuccess(true);
        reset(values);
      } catch (error) {
        setMessage(getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ Р·Р±РµСЂРµРіС‚Рё Р·Р°РїРёСЃ.'));
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-5 rounded-2xl border bg-white p-5 shadow-sm"
    >
      <FragrancePicker
        value={fragranceId || null}
        initialOptions={options}
        onChange={(fragrance) => {
          setValue('fragrance_id', fragrance.id, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }}
        error={errors.fragrance_id?.message}
      />

      <input
        type="hidden"
        {...register('fragrance_id', {
          required: 'РћР±РµСЂС–С‚СЊ Р°СЂРѕРјР°С‚ Р· РµРЅС†РёРєР»РѕРїРµРґС–С—.',
          validate: (value) => {
            const id = Number(value);

            return Number.isInteger(id) && id > 0
              ? true
              : 'РћР±РµСЂС–С‚СЊ Р°СЂРѕРјР°С‚ Р· РµРЅС†РёРєР»РѕРїРµРґС–С—.';
          },
        })}
      />

      <div className="grid gap-2">
        <label
          htmlFor="wardrobe-status"
          className="text-sm font-medium text-gray-900"
        >
          РЎС‚Р°С‚СѓСЃ
        </label>

        <select
          id="wardrobe-status"
          {...register('status', {
            required: 'РћР±РµСЂС–С‚СЊ СЃС‚Р°С‚СѓСЃ.',
          })}
          className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
        >
          {WARDROBE_STATUS_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        {errors.status?.message ? (
          <p className="text-xs text-red-600">{errors.status.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="wardrobe-rating"
          className="text-sm font-medium text-gray-900"
        >
          РћС†С–РЅРєР°
        </label>

        <input
          id="wardrobe-rating"
          type="number"
          min={1}
          max={10}
          placeholder="1вЂ“10"
          {...register('rating', {
            setValueAs: (value) => (value === '' ? '' : Number(value)),
            validate: (value) => {
              if (value === '') {
                return true;
              }

              const rating = Number(value);

              return Number.isInteger(rating) && rating >= 1 && rating <= 10
                ? true
                : 'РћС†С–РЅРєР° РјР°С” Р±СѓС‚Рё РІС–Рґ 1 РґРѕ 10.';
            },
          })}
          className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
        />

        {errors.rating?.message ? (
          <p className="text-xs text-red-600">{errors.rating.message}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="wardrobe-notes"
          className="text-sm font-medium text-gray-900"
        >
          РќРѕС‚Р°С‚РєРё
        </label>

        <textarea
          id="wardrobe-notes"
          rows={5}
          placeholder="Р’Р°С€С– РІСЂР°Р¶РµРЅРЅСЏ, Р°СЃРѕС†С–Р°С†С–С—, СЃС‚С–Р№РєС–СЃС‚СЊ, СЃРµР·РѕРЅРЅС–СЃС‚СЊ..."
          {...register('notes')}
          className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
        />
      </div>

      <label className="flex items-start gap-2 rounded-xl border bg-gray-50 p-3 text-sm">
        <input
          type="checkbox"
          {...register('is_private')}
          className="mt-0.5"
        />

        <span>
          <span className="block font-medium text-gray-900">
            РџСЂРёРІР°С‚РЅРёР№ Р·Р°РїРёСЃ
          </span>

          <span className="block text-gray-500">
            РџСЂРёРІР°С‚РЅС– Р°СЂРѕРјР°С‚Рё РЅРµ РїРѕРєР°Р·СѓСЋС‚СЊСЃСЏ Сѓ РїСѓР±Р»С–С‡РЅРѕРјСѓ РіР°СЂРґРµСЂРѕР±С–.
          </span>
        </span>
      </label>

      {message ? (
        <p
          className={[
            'rounded-xl p-3 text-sm',
            isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700',
          ].join(' ')}
        >
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isPending || (mode === 'edit' && !isDirty)}
          className={buttonStyles.primary}
        >
          {isPending
            ? 'Р—Р±РµСЂРµР¶РµРЅРЅСЏ...'
            : mode === 'create'
              ? 'Р”РѕРґР°С‚Рё РґРѕ РіР°СЂРґРµСЂРѕР±Р°'
              : 'Р—Р±РµСЂРµРіС‚Рё Р·РјС–РЅРё'}
        </button>

        {successHref ? (
          <Link
            href={successHref}
            className={`${buttonStyles.secondary}`}
          >
            {successLinkLabel}
          </Link>
        ) : null}
      </div>
    </form>
  );
}
