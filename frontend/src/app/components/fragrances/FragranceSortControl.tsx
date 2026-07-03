'use client';

import { fragranceFilterStyles as styles } from '@/app/components/fragrances/fragranceEncyclopedia.styles';
import type { FragranceOrdering } from '@/app/types/fragranceTypes';
import {
  HiddenQueryFields,
  ORDERING_OPTIONS,
} from '@/app/utils/fragranceFilterForm.utils';

type FragranceSortControlProps = {
  value: FragranceOrdering;
  listHref: string;
  hiddenValues: Record<string, unknown>;
};

export function FragranceSortControl({
  value,
  listHref,
  hiddenValues,
}: FragranceSortControlProps) {
  return (
    <form action={listHref} method="get" className={styles.sortBar}>
      <input type="hidden" name="page" value="1" />
      <HiddenQueryFields values={hiddenValues} />

      <label className={styles.sortField}>
        <span className={styles.sortLabel}>РЎРѕСЂС‚СѓРІР°С‚Рё Р·Р°</span>

        <select
          name="ordering"
          value={value}
          className={styles.input}
          onChange={(event) => {
            const form = event.currentTarget.form;

            if (!form) {
              return;
            }

            if (typeof form.requestSubmit === 'function') {
              form.requestSubmit();
              return;
            }

            form.submit();
          }}
        >
          {ORDERING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </form>
  );
}
