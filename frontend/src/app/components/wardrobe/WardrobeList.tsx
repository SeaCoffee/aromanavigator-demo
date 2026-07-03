import type { ReactNode } from 'react';

import WardrobeItemCard from '@/app/components/wardrobe/WardrobeItemCard';
import { WARDROBE_STATUS_OPTIONS } from '@/app/components/wardrobe/wardrobeConstants';
import { wardrobeStyles as styles } from '@/app/components/wardrobe/wardrobe.styles';
import type { WardrobeItem } from '@/app/types/wardrobeTypes';

type Props = {
  items: WardrobeItem[];
  emptyText?: string;
  getFragranceHref: (item: WardrobeItem) => string | null;
  getActions?: (item: WardrobeItem) => ReactNode;
};

function groupItems(items: WardrobeItem[]) {
  return WARDROBE_STATUS_OPTIONS.map((option) => ({
    status: option.value,
    label: option.label,
    items: items.filter((item) => item.status === option.value),
  })).filter((group) => group.items.length > 0);
}

export default function WardrobeList({
  items,
  emptyText = 'РЈ РіР°СЂРґРµСЂРѕР±С– РїРѕРєРё РЅРµРјР°С” Р°СЂРѕРјР°С‚С–РІ.',
  getFragranceHref,
  getActions,
}: Props) {
  if (items.length === 0) {
    return <div className={styles.empty}>{emptyText}</div>;
  }

  return (
    <section className={styles.listShell}>
      {groupItems(items).map((group) => (
        <section className={styles.statusGroup} key={group.status}>
          <header className={styles.statusSummary}>
            <span className={styles.statusTitle}>{group.label}</span>
            <span className={styles.statusCount}>{group.items.length}</span>
          </header>

          <div className="grid gap-3 md:grid-cols-2">
            {group.items.map((item) => (
              <WardrobeItemCard
                key={item.id}
                item={item}
                fragranceHref={getFragranceHref(item)}
                actions={getActions?.(item)}
              />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
