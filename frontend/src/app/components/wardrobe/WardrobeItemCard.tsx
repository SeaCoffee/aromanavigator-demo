import Link from 'next/link';
import type { ReactNode } from 'react';

import MediaImage from '@/app/components/images/MediaImage';
import { WARDROBE_STATUS_OPTIONS } from '@/app/components/wardrobe/wardrobeConstants';
import type { WardrobeItem } from '@/app/types/wardrobeTypes';
import { getFragranceImageUrl } from '@/app/utils/fragranceImageUtils';

type Props = {
  item: WardrobeItem;
  actions?: ReactNode;
  fragranceHref?: string | null;
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getFragranceTitle(item: WardrobeItem) {
  return `${item.fragrance.brand.name} - ${item.fragrance.name}`;
}

function getStatusLabel(item: WardrobeItem) {
  return (
    WARDROBE_STATUS_OPTIONS.find((option) => option.value === item.status)
      ?.label ?? item.status_label
  );
}

export default function WardrobeItemCard({
  item,
  actions,
  fragranceHref = null,
}: Props) {
  const fragrance = item.fragrance;
  const title = getFragranceTitle(item);
  const image = getFragranceImageUrl(fragrance.cover_image);

  return (
    <article className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="shrink-0">
          <MediaImage
            src={image}
            alt={title}
            className="h-14 w-14 rounded-xl border object-cover"
            fallbackClassName="grid h-14 w-14 place-items-center rounded-xl border bg-gray-50 text-[10px] text-gray-400"
            fallback="Р±РµР· С„РѕС‚Рѕ"
          />
        </div>

        <div className="min-w-0 flex-1">
          {fragranceHref ? (
            <Link
              href={fragranceHref}
              className="text-base font-semibold text-gray-950 hover:underline"
            >
              {title}
            </Link>
          ) : (
            <h2 className="text-base font-semibold text-gray-950">{title}</h2>
          )}

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="rounded-full border px-2 py-1">
              {getStatusLabel(item)}
            </span>

            {item.rating ? (
              <span className="rounded-full border px-2 py-1">
                РѕС†С–РЅРєР°: {item.rating}/10
              </span>
            ) : null}

            {item.is_private ? (
              <span className="rounded-full border px-2 py-1">РїСЂРёРІР°С‚РЅРѕ</span>
            ) : null}

            {fragrance.release_year ? (
              <span className="rounded-full border px-2 py-1">
                {fragrance.release_year}
              </span>
            ) : null}
          </div>

          {item.notes ? (
            <p className="mt-3 text-sm leading-6 text-gray-700">
              {item.notes}
            </p>
          ) : null}

          <p className="mt-3 text-xs text-gray-400">
            РћРЅРѕРІР»РµРЅРѕ: {formatDate(item.updated_at)}
          </p>
        </div>
      </div>

      {actions ? (
        <div className="mt-4 flex flex-wrap gap-2 border-t pt-3">
          {actions}
        </div>
      ) : null}
    </article>
  );
}
