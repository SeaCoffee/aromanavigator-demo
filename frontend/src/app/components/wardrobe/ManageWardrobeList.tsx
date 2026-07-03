'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import MediaImage from '@/app/components/images/MediaImage';
import WardrobeDeleteButton from '@/app/components/wardrobe/WardrobeDeleteButton';
import { WARDROBE_STATUS_OPTIONS } from '@/app/components/wardrobe/wardrobeConstants';
import { wardrobeStyles as s } from '@/app/components/wardrobe/wardrobe.styles';
import type { WardrobeItem, WardrobeStatus } from '@/app/types/wardrobeTypes';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { getFragranceImageUrl } from '@/app/utils/fragranceImageUtils';

type Props = {
  items: WardrobeItem[];
  emptyText?: string;
};

type StatusGroup = {
  status: WardrobeStatus;
  items: WardrobeItem[];
};

type BrandGroup = {
  brandName: string;
  items: WardrobeItem[];
};

function getStatusLabel(status: WardrobeStatus) {
  return (
    WARDROBE_STATUS_OPTIONS.find((option) => option.value === status)?.label ??
    status
  );
}

function getStatusIcon(status: WardrobeStatus) {
  const icons: Record<WardrobeStatus, string> = {
    own: 'в—†',
    want: 'в™Ў',
    had: 'в†є',
    sample: 'в—Њ',
    favorite: 'в…',
  };

  return icons[status];
}

function getFragranceTitle(item: WardrobeItem) {
  return `${item.fragrance.brand.name} вЂ” ${item.fragrance.name}`;
}

function getFragranceHref(item: WardrobeItem) {
  return item.fragrance?.slug
    ? fragrancePageUrlBuilder.public.detail(item.fragrance.slug)
    : null;
}

function groupItemsByStatus(items: WardrobeItem[]): StatusGroup[] {
  const map = new Map<WardrobeStatus, WardrobeItem[]>();

  WARDROBE_STATUS_OPTIONS.forEach((option) => {
    map.set(option.value, []);
  });

  items.forEach((item) => {
    const current = map.get(item.status) ?? [];

    current.push(item);
    map.set(item.status, current);
  });

  return Array.from(map.entries())
    .map(([status, statusItems]) => ({
      status,
      items: statusItems,
    }))
    .filter((group) => group.items.length > 0);
}

function groupItemsByBrand(items: WardrobeItem[]): BrandGroup[] {
  const map = new Map<string, WardrobeItem[]>();

  items.forEach((item) => {
    const brandName = item.fragrance.brand.name || 'Р‘РµР· Р±СЂРµРЅРґСѓ';
    const current = map.get(brandName) ?? [];

    current.push(item);
    map.set(brandName, current);
  });

  return Array.from(map.entries()).map(([brandName, brandItems]) => ({
    brandName,
    items: brandItems,
  }));
}

function WardrobeCompactItem({
  item,
  onDeleted,
}: {
  item: WardrobeItem;
  onDeleted: () => void;
}) {
  const title = getFragranceTitle(item);
  const image = getFragranceImageUrl(item.fragrance.cover_image);
  const fragranceHref = getFragranceHref(item);

  const titleNode = fragranceHref ? (
    <Link href={fragranceHref} className={s.itemTitleLink} title={title}>
      {item.fragrance.name}
    </Link>
  ) : (
    <span className={s.itemTitle} title={title}>
      {item.fragrance.name}
    </span>
  );

  return (
    <div className={s.itemChip}>
      <MediaImage
        src={image}
        alt={title}
        className={s.itemImage}
        fallbackClassName={s.itemFallback}
        fallback={item.fragrance.brand.name.slice(0, 1)}
      />

      {titleNode}

      {item.rating ? (
        <span className={s.itemBadge}>{item.rating}/10</span>
      ) : null}

      {item.notes ? (
        <span className={s.itemFlag} title={item.notes}>
          вњЋ
        </span>
      ) : null}

      {item.is_private ? (
        <span className={s.itemFlag} title="РџСЂРёРІР°С‚РЅРёР№ Р·Р°РїРёСЃ">
          в—ђ
        </span>
      ) : null}

      {item.fragrance.release_year ? (
        <span className={s.itemBadge}>{item.fragrance.release_year}</span>
      ) : null}

      <WardrobeDeleteButton
        itemId={item.id}
        onDeleted={onDeleted}
        variant="icon"
        label={`Р’РёРґР°Р»РёС‚Рё ${title}`}
      />
    </div>
  );
}

export default function ManageWardrobeList({
  items,
  emptyText = 'РЈ РіР°СЂРґРµСЂРѕР±С– РїРѕРєРё РЅРµРјР°С” Р°СЂРѕРјР°С‚С–РІ.',
}: Props) {
  const [visibleItems, setVisibleItems] = useState(items);

  useEffect(() => {
    setVisibleItems(items);
  }, [items]);

  const statusGroups = useMemo(
    () => groupItemsByStatus(visibleItems),
    [visibleItems],
  );

  function removeItem(itemId: WardrobeItem['id']) {
    setVisibleItems((current) =>
      current.filter((item) => String(item.id) !== String(itemId)),
    );
  }

  if (!visibleItems.length) {
    return <div className={s.empty}>{emptyText}</div>;
  }

  return (
    <section className={s.listShell}>
      {statusGroups.map((statusGroup) => {
        const brandGroups = groupItemsByBrand(statusGroup.items);
        const shouldOpen = statusGroup.items.length <= 40;

        return (
          <details
            className={s.statusGroup}
            key={statusGroup.status}
            open={shouldOpen}
          >
            <summary className={s.statusSummary}>
              <span className={s.statusSummaryLeft}>
                <span className={s.statusIcon}>
                  {getStatusIcon(statusGroup.status)}
                </span>

                <span className={s.statusTitle}>
                  {getStatusLabel(statusGroup.status)}
                </span>
              </span>

              <span className={s.statusCount}>{statusGroup.items.length}</span>
            </summary>

            <div className={s.brandLanes}>
              {brandGroups.map((brandGroup) => (
                <section className={s.brandLane} key={brandGroup.brandName}>
                  <div className={s.brandLaneHeader}>
                    <h3 className={s.brandLaneTitle}>{brandGroup.brandName}</h3>
                    <span className={s.brandLaneCount}>
                      {brandGroup.items.length}
                    </span>
                  </div>

                  <div className={s.brandItems}>
                    {brandGroup.items.map((item) => (
                      <WardrobeCompactItem
                        key={item.id}
                        item={item}
                        onDeleted={() => removeItem(item.id)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </details>
        );
      })}
    </section>
  );
}
