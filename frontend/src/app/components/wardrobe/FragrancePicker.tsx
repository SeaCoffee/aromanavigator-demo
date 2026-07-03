'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';

import { searchFragrancesAction } from '@/app/actions/fragranceActions';
import type { FragranceListItem } from '@/app/types/fragranceTypes';
import type { ID } from '@/app/types/http';

type Props = {
  value: ID | null;
  onChange: (fragrance: FragranceListItem) => void;
  initialOptions?: FragranceListItem[];
  error?: string;
};

function getFragranceDisplayName(fragrance: FragranceListItem) {
  const year = fragrance.release_year ? `, ${fragrance.release_year}` : '';

  return `${fragrance.brand.name} вЂ” ${fragrance.name}${year}`;
}

export default function FragrancePicker({
  value,
  onChange,
  initialOptions = [],
  error = '',
}: Props) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<FragranceListItem[]>(initialOptions);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  const hasSearchQuery = query.trim().length >= 2;

  const selectedFragrance = useMemo(() => {
    if (!value) {
      return null;
    }

    return options.find((item) => String(item.id) === String(value)) ?? null;
  }, [options, value]);

  useEffect(() => {
    if (query.trim()) {
      return;
    }

    setOptions(initialOptions);
  }, [initialOptions, query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const cleanQuery = query.trim();

      if (cleanQuery.length > 0 && cleanQuery.length < 2) {
        return;
      }

      if (!cleanQuery) {
        setMessage('');
        setOptions(initialOptions);
        return;
      }

      setMessage('');

      startTransition(async () => {
        const result = await searchFragrancesAction(cleanQuery);

        if (!result.ok) {
          setMessage(typeof result.msg === 'string' ? result.msg : 'РџРѕРјРёР»РєР°.');
          return;
        }

        setOptions(result.data ?? []);
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [initialOptions, query]);

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-gray-900">
        РђСЂРѕРјР°С‚ Р· РµРЅС†РёРєР»РѕРїРµРґС–С—
      </label>

      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="РџРѕС‡РЅС–С‚СЊ РІРІРѕРґРёС‚Рё Р±СЂРµРЅРґ Р°Р±Рѕ РЅР°Р·РІСѓ Р°СЂРѕРјР°С‚Сѓ"
        className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-gray-900"
      />

      {selectedFragrance ? (
        <div className="rounded-xl border bg-gray-50 p-3 text-sm">
          <p className="font-medium text-gray-950">
            РћР±СЂР°РЅРѕ: {getFragranceDisplayName(selectedFragrance)}
          </p>
        </div>
      ) : null}

      <div className="grid max-h-72 gap-2 overflow-auto rounded-xl border bg-white p-2">
        {isPending ? (
          <p className="px-2 py-1 text-sm text-gray-500">РџРѕС€СѓРє...</p>
        ) : null}

        {!isPending && !options.length && hasSearchQuery ? (
          <p className="px-2 py-1 text-sm text-gray-500">
            РђСЂРѕРјР°С‚Рё РЅРµ Р·РЅР°Р№РґРµРЅРѕ.
          </p>
        ) : null}

        {options.map((fragrance) => {
          const isSelected = String(fragrance.id) === String(value);

          return (
            <button
              key={fragrance.id}
              type="button"
              onClick={() => onChange(fragrance)}
              className={[
                'rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-50',
                isSelected ? 'bg-gray-100 font-medium' : '',
              ].join(' ')}
            >
              <span className="block text-gray-950">
                {getFragranceDisplayName(fragrance)}
              </span>

              <span className="block text-xs text-gray-500">
                Р’РїРѕРґРѕР±Р°РЅСЊ: {fragrance.likes_count}
              </span>
            </button>
          );
        })}
      </div>

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      {message ? <p className="text-xs text-red-600">{message}</p> : null}
    </div>
  );
}
