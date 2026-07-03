'use client';

import { useId, useMemo, useState } from 'react';

import type { ID } from '@/app/types/http';

export type SearchablePickerItem = {
  id: ID;
  name: string;
};

type SearchablePickerProps = {
  label: string;
  placeholder?: string;
  emptyText?: string;
  items: SearchablePickerItem[];
  disabled?: boolean;
  limit?: number;
  onPick: (id: ID) => void;
};

export default function SearchablePicker({
  label,
  placeholder = 'РџРѕС€СѓРє...',
  emptyText = 'РќС–С‡РѕРіРѕ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.',
  items,
  disabled = false,
  limit = 30,
  onPick,
}: SearchablePickerProps) {
  const [query, setQuery] = useState('');
  const inputId = useId();

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items.slice(0, limit);
    }

    return items
      .filter((item) => item.name.toLowerCase().includes(normalizedQuery))
      .slice(0, limit);
  }, [items, limit, query]);
  const hasQuery = query.trim().length > 0;

  return (
    <div className="grid gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-neutral-800">
        {label}
      </label>

      <input
        id={inputId}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none transition focus:border-[#641f32] disabled:cursor-not-allowed disabled:opacity-50"
      />

      <div className="max-h-56 overflow-auto rounded-lg border border-neutral-200">
        {filteredItems.length === 0 && hasQuery ? (
          <div className="p-3 text-sm text-neutral-500">{emptyText}</div>
        ) : (
          <div className="grid">
            {filteredItems.map((item) => (
              <button
                key={String(item.id)}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onPick(item.id);
                  setQuery('');
                }}
                className="border-b border-neutral-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {item.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
