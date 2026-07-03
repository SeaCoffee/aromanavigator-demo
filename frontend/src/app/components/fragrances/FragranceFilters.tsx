'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { FragranceBuilderFilterForm } from '@/app/components/fragrances/FragranceBuilderFilterForm';
import { fragranceFilterStyles as styles } from '@/app/components/fragrances/fragranceEncyclopedia.styles';
import { FragranceSearchForm } from '@/app/components/fragrances/FragranceSearchForm';
import { FragranceSortControl } from '@/app/components/fragrances/FragranceSortControl';
import type { FragranceListQuery } from '@/app/types/fragranceTypes';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import {
  buildQuery,
  getAppliedBuilderValues,
  getAppliedOrderingValue,
  getAppliedSearchValues,
  getBuilderDefaultValues,
  getCommonValues,
  getSearchDefaultValues,
} from '@/app/utils/fragranceFilterForm.utils';

type FragranceFiltersProps = {
  filters: FragranceListQuery;
};

function countAppliedFilters(filters: FragranceListQuery) {
  return [
    filters.brand,
    filters.fragrance_id,
    filters.name,
    filters.year_from,
    filters.year_to,
    ...(Array.isArray(filters.family) ? filters.family : [filters.family]),
    ...(Array.isArray(filters.note) ? filters.note : [filters.note]),
    filters.note_level,
    ...(Array.isArray(filters.perfumer) ? filters.perfumer : [filters.perfumer]),
  ].filter((value) => String(value ?? '').trim()).length;
}

function buildListHref(values: Record<string, unknown>) {
  return fragrancePageUrlBuilder.public.list(buildQuery(values));
}

export default function FragranceFilters({ filters }: FragranceFiltersProps) {
  const listHref = fragrancePageUrlBuilder.public.list();

  const searchDefaultValues = useMemo(
    () => getSearchDefaultValues(filters),
    [filters],
  );

  const builderDefaultValues = useMemo(
    () => getBuilderDefaultValues(filters),
    [filters],
  );

  const commonValues = useMemo(
    () => getCommonValues(filters),
    [filters],
  );

  const appliedSearchValues = useMemo(
    () => getAppliedSearchValues(filters),
    [filters],
  );

  const appliedBuilderValues = useMemo(
    () => getAppliedBuilderValues(filters),
    [filters],
  );

  const orderingValue = useMemo(
    () => getAppliedOrderingValue(filters),
    [filters],
  );

  const appliedFiltersCount = useMemo(
    () => countAppliedFilters(filters),
    [filters],
  );

  const searchResetHref = useMemo(
    () =>
      buildListHref({
        ...commonValues,
        ordering: orderingValue,
      }),
    [commonValues, orderingValue],
  );

  const builderResetHref = searchResetHref;

  const sortHiddenValues = useMemo(
    () => ({
      ...commonValues,
      ...appliedSearchValues,
      ...appliedBuilderValues,
    }),
    [appliedBuilderValues, appliedSearchValues, commonValues],
  );

  return (
    <section className={styles.shell}>
      <div className={styles.applied}>
        <div className={styles.appliedTop}>
          <div className={styles.appliedTitle}>
            РћР±СЂР°РЅС– С„С–Р»СЊС‚СЂРё: {appliedFiltersCount}
          </div>

          {appliedFiltersCount > 0 ? (
            <Link href={listHref} className={styles.resetStrong}>
              РћС‡РёСЃС‚РёС‚Рё
            </Link>
          ) : null}
        </div>

        {appliedFiltersCount > 0 ? (
          <div className={styles.chips}>
            {appliedSearchValues.name ? (
              <span className={styles.chip}>РџРѕС€СѓРє: {appliedSearchValues.name}</span>
            ) : null}
            {appliedSearchValues.year_from ? (
              <span className={styles.chip}>Р’С–Рґ {appliedSearchValues.year_from}</span>
            ) : null}
            {appliedSearchValues.year_to ? (
              <span className={styles.chip}>Р”Рѕ {appliedSearchValues.year_to}</span>
            ) : null}
            {appliedBuilderValues.note_level ? (
              <span className={styles.chip}>
                Р С–РІРµРЅСЊ РЅРѕС‚: {appliedBuilderValues.note_level}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <FragranceSortControl
        value={orderingValue}
        listHref={listHref}
        hiddenValues={sortHiddenValues}
      />

      <FragranceSearchForm
        listHref={listHref}
        defaultValues={searchDefaultValues}
        hiddenValues={{
          ...commonValues,
          ordering: orderingValue,
        }}
        resetHref={searchResetHref}
      />

      <FragranceBuilderFilterForm
        listHref={listHref}
        defaultValues={builderDefaultValues}
        hiddenValues={{
          ...commonValues,
          ordering: orderingValue,
        }}
        resetHref={builderResetHref}
      />
    </section>
  );
}
