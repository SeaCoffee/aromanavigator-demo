'use client';

import { buttonStyles } from '@/app/components/common/buttonStyles';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';

import { toggleWardrobeStatusAction } from '@/app/actions/wardrobeActions';
import { WARDROBE_STATUS_OPTIONS } from '@/app/components/wardrobe/wardrobeConstants';
import { messageToText } from '@/app/components/wardrobe/wardrobeMessages';
import type { ID } from '@/app/types/http';
import type { WardrobeItem, WardrobeStatus } from '@/app/types/wardrobeTypes';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { wardrobePageUrlBuilder } from '@/app/urls/pageUrls/wardrobePageUrlBuilder';

type Props = {
  fragranceId: ID;
  refreshPath: string;
  initialItems: WardrobeItem[];
  isAuthenticated: boolean;
};

function getItemsByStatus(items: WardrobeItem[]) {
  return new Map(
    items.map((item) => [item.status, item] as [WardrobeStatus, WardrobeItem]),
  );
}

export default function FragranceWardrobeStatusPanel({
  fragranceId,
  refreshPath,
  initialItems,
  isAuthenticated,
}: Props) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const itemsByStatus = useMemo(() => getItemsByStatus(items), [items]);

  function toggleStatus(status: WardrobeStatus) {
    const activeItem = itemsByStatus.get(status);

    setMessage('');

    startTransition(async () => {
      const result = await toggleWardrobeStatusAction({
        fragrance_id: fragranceId,
        status,
        active_item_id: activeItem?.id ?? null,
        refreshPaths: [refreshPath],
      });

      if (!result.ok) {
        setMessage(messageToText(result.msg));
        return;
      }

      if (activeItem) {
        setItems((current) =>
          current.filter((item) => String(item.id) !== String(activeItem.id)),
        );
      } else if (result.data) {
        setItems((current) => [result.data as WardrobeItem, ...current]);
      }

      setMessage(messageToText(result.msg));
    });
  }

  if (!isAuthenticated) {
    return (
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#eadfd5] bg-white p-4">
        <div className="grid gap-1">
          <h2 className="text-lg font-semibold text-neutral-950">РњС–Р№ РіР°СЂРґРµСЂРѕР±</h2>
          <p className="text-sm text-neutral-600">
            РџРѕР·РЅР°С‡Р°Р№С‚Рµ Р°СЂРѕРјР°С‚Рё, СЏРєС– РјР°С”С‚Рµ, С…РѕС‡РµС‚Рµ Р°Р±Рѕ С‚РµСЃС‚СѓС”С‚Рµ.
          </p>
        </div>
        <Link
          href={authPageUrlBuilder.login({ next: refreshPath })}
          className={buttonStyles.compactSecondary}
        >
          РЈРІС–Р№С‚Рё
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-neutral-950">РњС–Р№ РіР°СЂРґРµСЂРѕР±</h2>
          <p className="mt-1 text-sm text-neutral-600">
            РћР±РµСЂС–С‚СЊ, СЏРєРµ РјС–СЃС†Рµ С†РµР№ Р°СЂРѕРјР°С‚ Р·Р°Р№РјР°С” Сѓ РІР°С€С–Р№ РєРѕР»РµРєС†С–С—.
          </p>
        </div>

        <Link
          href={wardrobePageUrlBuilder.me.list({ fragrance: fragranceId })}
          className={`${buttonStyles.compactSecondary}`}
        >
          Р’С–РґРєСЂРёС‚Рё Р·Р°РїРёСЃРё
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {WARDROBE_STATUS_OPTIONS.map((option) => {
          const active = itemsByStatus.has(option.value);

          return (
            <button
              key={option.value}
              type="button"
              disabled={isPending}
              onClick={() => toggleStatus(option.value)}
              className={[
                'rounded-full border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
                active
                  ? 'border-[#641f32] bg-[#641f32] text-white'
                  : 'border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50',
              ].join(' ')}
              aria-pressed={active}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {message ? <p className="text-sm text-neutral-600">{message}</p> : null}
    </section>
  );
}
