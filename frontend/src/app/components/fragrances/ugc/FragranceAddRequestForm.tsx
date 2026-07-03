'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import { createFragranceAddRequestAction } from '@/app/actions/fragranceUgcActions';
import {
  actionResultMessage,
  isSuccessMessage,
  toFriendlyActionMessage,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';
import { AddRequestFormValues } from '@/app/types/fragranceTypes';
import Link from 'next/link';
import { fragranceUgcPageUrlBuilder } from '@/app/urls/pageUrls/fragranceUgcPageUrlBuilder';
import { validateFragranceReleaseYear } from '@/app/utils/fragranceYearUtils';

const MAX_LENGTHS = {
  brand_name: 255,
  fragrance_name: 255,
  release_year: 4,
  perfumers_text: 500,
  note_field: 500,
  families_text: 500,
  links_text: 2000,
};

function joinNotes(
  values: Pick<AddRequestFormValues, 'top_notes' | 'heart_notes' | 'base_notes'>,
) {
  const sections = [
    values.top_notes.trim() ? `Р’РµСЂС…РЅС– РЅРѕС‚Рё: ${values.top_notes.trim()}` : '',
    values.heart_notes.trim() ? `РќРѕС‚Рё СЃРµСЂС†СЏ: ${values.heart_notes.trim()}` : '',
    values.base_notes.trim() ? `Р‘Р°Р·РѕРІС– РЅРѕС‚Рё: ${values.base_notes.trim()}` : '',
  ].filter(Boolean);

  return sections.join('\n');
}

function validateRequiredText(value: string, message: string) {
  return value.trim().length > 0 || message;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateLinks(value: string) {
  const clean = value.trim();

  if (!clean) {
    return true;
  }

  if (clean.length > MAX_LENGTHS.links_text) {
    return `РњР°РєСЃРёРјСѓРј ${MAX_LENGTHS.links_text} СЃРёРјРІРѕР»С–РІ.`;
  }

  const lines = clean
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const hasInvalidLink = lines.some((line) => !isValidHttpUrl(line));

  if (hasInvalidLink) {
    return 'РљРѕР¶РЅРµ РґР¶РµСЂРµР»Рѕ РјР°С” Р±СѓС‚Рё РІР°Р»С–РґРЅРёРј РїРѕСЃРёР»Р°РЅРЅСЏРј Р· http:// Р°Р±Рѕ https://.';
  }

  return true;
}

export default function FragranceAddRequestForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<AddRequestFormValues>({
    mode: 'onBlur',
    defaultValues: {
      brand_name: '',
      fragrance_name: '',
      release_year: '',
      perfumers_text: '',
      top_notes: '',
      heart_notes: '',
      base_notes: '',
      families_text: '',
      links_text: '',
    },
  });

  const onSubmit = (values: AddRequestFormValues) => {
    setMessage(null);

    const brandName = values.brand_name.trim();
    const fragranceName = values.fragrance_name.trim();

    if (!brandName || !fragranceName) {
      setMessage('РџРѕС‚СЂС–Р±РЅРѕ РІРєР°Р·Р°С‚Рё Р±СЂРµРЅРґ С– РЅР°Р·РІСѓ Р°СЂРѕРјР°С‚Сѓ.');
      return;
    }

    const formData = new FormData();
    formData.set('brand_name', brandName);
    formData.set('fragrance_name', fragranceName);
    formData.set('release_year', values.release_year.trim());
    formData.set('perfumers_text', values.perfumers_text.trim());
    formData.set('notes_text', joinNotes(values));
    formData.set('families_text', values.families_text.trim());
    formData.set('links_text', values.links_text.trim());

    startTransition(() => {
      void (async () => {
        try {
          const result = await createFragranceAddRequestAction(null, formData);

          setMessage(toFriendlyActionMessage(actionResultMessage(result)));

          if (result.ok) {
            reset();
          }
        } catch {
          setMessage('РќРµ РІРґР°Р»РѕСЃСЏ РЅР°РґС–СЃР»Р°С‚Рё Р·Р°СЏРІРєСѓ. РЎРїСЂРѕР±СѓР№С‚Рµ С‰Рµ СЂР°Р·.');
        }
      })();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <header className="grid gap-1">
        <h3 className="text-xl font-semibold">РќРµ Р·РЅР°Р№С€Р»Рё Р°СЂРѕРјР°С‚?</h3>
        <p className="text-sm text-neutral-600">
          РќР°РґС–С€Р»С–С‚СЊ Р·Р°СЏРІРєСѓ, С– РјРѕРґРµСЂР°С‚РѕСЂ РґРѕРґР°СЃС‚СЊ Р°СЂРѕРјР°С‚ РґРѕ РґРѕРІС–РґРЅРёРєР° РїС–СЃР»СЏ
          РїРµСЂРµРІС–СЂРєРё.
        </p>
        <p className="text-sm text-neutral-500">
          РЎС‚Р°С‚СѓСЃ РїРµСЂРµРІС–СЂРєРё С‚Р° РєРѕРјРµРЅС‚Р°СЂ РјРѕРґРµСЂР°С‚РѕСЂР° Р·вЂ™СЏРІР»СЏС‚СЊСЃСЏ Сѓ РІР°С€РёС… Р·Р°СЏРІРєР°С….
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 md:col-span-2">
          <span className="text-sm font-medium">Р‘СЂРµРЅРґ</span>
          <input
            {...register('brand_name', {
              required: 'Р’РєР°Р¶С–С‚СЊ Р±СЂРµРЅРґ.',
              maxLength: {
                value: MAX_LENGTHS.brand_name,
                message: `РњР°РєСЃРёРјСѓРј ${MAX_LENGTHS.brand_name} СЃРёРјРІРѕР»С–РІ.`,
              },
              validate: (value) => validateRequiredText(value, 'Р’РєР°Р¶С–С‚СЊ Р±СЂРµРЅРґ.'),
            })}
            aria-invalid={Boolean(errors.brand_name)}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 outline-none"
            disabled={isPending}
            maxLength={MAX_LENGTHS.brand_name}
            placeholder="РќР°Р·РІР° Р±СЂРµРЅРґСѓ"
          />
          {errors.brand_name ? (
            <div className="text-sm text-red-600">
              {errors.brand_name.message}
            </div>
          ) : null}
        </label>

        <label className="grid gap-1 md:col-span-2">
          <span className="text-sm font-medium">РќР°Р·РІР° Р°СЂРѕРјР°С‚Сѓ</span>
          <input
            {...register('fragrance_name', {
              required: 'Р’РєР°Р¶С–С‚СЊ РЅР°Р·РІСѓ Р°СЂРѕРјР°С‚Сѓ.',
              maxLength: {
                value: MAX_LENGTHS.fragrance_name,
                message: `РњР°РєСЃРёРјСѓРј ${MAX_LENGTHS.fragrance_name} СЃРёРјРІРѕР»С–РІ.`,
              },
              validate: (value) =>
                validateRequiredText(value, 'Р’РєР°Р¶С–С‚СЊ РЅР°Р·РІСѓ Р°СЂРѕРјР°С‚Сѓ.'),
            })}
            aria-invalid={Boolean(errors.fragrance_name)}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 outline-none"
            disabled={isPending}
            maxLength={MAX_LENGTHS.fragrance_name}
            placeholder="РќР°Р·РІР° Р°СЂРѕРјР°С‚Сѓ"
          />
          {errors.fragrance_name ? (
            <div className="text-sm text-red-600">
              {errors.fragrance_name.message}
            </div>
          ) : null}
        </label>

        <label className="grid gap-1 md:col-span-2">
          <span className="text-sm font-medium">Р С–Рє РІРёРїСѓСЃРєСѓ</span>
          <input
            {...register('release_year', {
              validate: validateFragranceReleaseYear,
            })}
            aria-invalid={Boolean(errors.release_year)}
            autoComplete="off"
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 outline-none"
            disabled={isPending}
            inputMode="numeric"
            maxLength={MAX_LENGTHS.release_year}
            placeholder="РќР°РїСЂРёРєР»Р°Рґ: 1998"
          />
          {errors.release_year ? (
            <div className="text-sm text-red-600">
              {errors.release_year.message}
            </div>
          ) : null}
        </label>

        <label className="grid gap-1 md:col-span-2">
          <span className="text-sm font-medium">РџР°СЂС„СѓРјРµСЂ(Рё)</span>
          <input
            {...register('perfumers_text', {
              maxLength: {
                value: MAX_LENGTHS.perfumers_text,
                message: `РњР°РєСЃРёРјСѓРј ${MAX_LENGTHS.perfumers_text} СЃРёРјРІРѕР»С–РІ.`,
              },
            })}
            aria-invalid={Boolean(errors.perfumers_text)}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 outline-none"
            disabled={isPending}
            maxLength={MAX_LENGTHS.perfumers_text}
          />
          {errors.perfumers_text ? (
            <div className="text-sm text-red-600">
              {errors.perfumers_text.message}
            </div>
          ) : null}
        </label>

        <label className="grid gap-1 md:col-span-2">
          <span className="text-sm font-medium">Р’РµСЂС…РЅС– РЅРѕС‚Рё</span>
          <input
            {...register('top_notes', {
              maxLength: {
                value: MAX_LENGTHS.note_field,
                message: `РњР°РєСЃРёРјСѓРј ${MAX_LENGTHS.note_field} СЃРёРјРІРѕР»С–РІ.`,
              },
            })}
            aria-invalid={Boolean(errors.top_notes)}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 outline-none"
            disabled={isPending}
            maxLength={MAX_LENGTHS.note_field}
            placeholder="РќР°РїСЂРёРєР»Р°Рґ: Р±РµСЂРіР°РјРѕС‚, Р»РёРјРѕРЅ, Р°Р»СЊРґРµРіС–РґРё"
          />
          {errors.top_notes ? (
            <div className="text-sm text-red-600">
              {errors.top_notes.message}
            </div>
          ) : null}
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">РќРѕС‚Рё СЃРµСЂС†СЏ</span>
          <input
            {...register('heart_notes', {
              maxLength: {
                value: MAX_LENGTHS.note_field,
                message: `РњР°РєСЃРёРјСѓРј ${MAX_LENGTHS.note_field} СЃРёРјРІРѕР»С–РІ.`,
              },
            })}
            aria-invalid={Boolean(errors.heart_notes)}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 outline-none"
            disabled={isPending}
            maxLength={MAX_LENGTHS.note_field}
            placeholder="РќР°РїСЂРёРєР»Р°Рґ: С‚СЂРѕСЏРЅРґР°, Р¶Р°СЃРјРёРЅ, С–СЂРёСЃ"
          />
          {errors.heart_notes ? (
            <div className="text-sm text-red-600">
              {errors.heart_notes.message}
            </div>
          ) : null}
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Р‘Р°Р·РѕРІС– РЅРѕС‚Рё</span>
          <input
            {...register('base_notes', {
              maxLength: {
                value: MAX_LENGTHS.note_field,
                message: `РњР°РєСЃРёРјСѓРј ${MAX_LENGTHS.note_field} СЃРёРјРІРѕР»С–РІ.`,
              },
            })}
            aria-invalid={Boolean(errors.base_notes)}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 outline-none"
            disabled={isPending}
            maxLength={MAX_LENGTHS.note_field}
            placeholder="РќР°РїСЂРёРєР»Р°Рґ: РјСѓСЃРєСѓСЃ, Р°РјР±СЂР°, СЃР°РЅРґР°Р»"
          />
          {errors.base_notes ? (
            <div className="text-sm text-red-600">
              {errors.base_notes.message}
            </div>
          ) : null}
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">РЎС–РјРµР№СЃС‚РІР°</span>
          <input
            {...register('families_text', {
              maxLength: {
                value: MAX_LENGTHS.families_text,
                message: `РњР°РєСЃРёРјСѓРј ${MAX_LENGTHS.families_text} СЃРёРјРІРѕР»С–РІ.`,
              },
            })}
            aria-invalid={Boolean(errors.families_text)}
            className="min-h-11 rounded-lg border border-neutral-300 px-3 py-2 outline-none"
            disabled={isPending}
            maxLength={MAX_LENGTHS.families_text}
          />
          {errors.families_text ? (
            <div className="text-sm text-red-600">
              {errors.families_text.message}
            </div>
          ) : null}
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Р”Р¶РµСЂРµР»Р°</span>
          <textarea
            {...register('links_text', {
              validate: validateLinks,
            })}
            aria-invalid={Boolean(errors.links_text)}
            className="min-h-28 w-full resize-y rounded-lg border border-neutral-300 px-3 py-2 outline-none"
            disabled={isPending}
            maxLength={MAX_LENGTHS.links_text}
            placeholder="РљРѕР¶РЅРµ РїРѕСЃРёР»Р°РЅРЅСЏ Р· РЅРѕРІРѕРіРѕ СЂСЏРґРєР°. РќР°РїСЂРёРєР»Р°Рґ: https://example.com/fragrance"
          />
          {errors.links_text ? (
            <div className="text-sm text-red-600">
              {errors.links_text.message}
            </div>
          ) : null}
        </label>
      </div>

      <div className="grid gap-2 md:flex md:items-center md:justify-between">
        <button
          type="submit"
          className={`${buttonStyles.primary}`}
          disabled={isPending}
        >
          {isPending ? 'РќР°РґСЃРёР»Р°С”РјРѕ...' : 'РќР°РґС–СЃР»Р°С‚Рё Р·Р°СЏРІРєСѓ'}
        </button>

        <p className="text-xs text-neutral-500 md:order-1">
          Р‘СЂРµРЅРґ С– РЅР°Р·РІР° РѕР±РѕРІвЂ™СЏР·РєРѕРІС–, С–РЅС€С– РІС–РґРѕРјРѕСЃС‚С– РґРѕРїРѕРјРѕР¶СѓС‚СЊ С€РІРёРґС€Рµ РїРµСЂРµРІС–СЂРёС‚Рё
          Р·Р°СЏРІРєСѓ.
        </p>
      </div>

      {message ? (
        <div
          className={`mt-3 text-sm ${
            isSuccessMessage(message) ? 'text-green-700' : 'text-red-600'
          }`}
        >
          {message}
        </div>
      ) : null}

      <Link
        href={fragranceUgcPageUrlBuilder.me.addRequests()}
        className="w-fit text-sm font-semibold text-[#6f3f2f] underline-offset-4 hover:underline"
      >
        РџРµСЂРµРіР»СЏРЅСѓС‚Рё РјРѕС— Р·Р°СЏРІРєРё
      </Link>
    </form>
  );
}
