'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { RemoteSingleSelect } from '@/app/components/fragrances/RemoteOptionSelect';
import { fragranceFilterStyles as styles } from '@/app/components/fragrances/fragranceEncyclopedia.styles';
import {
  getBrandOptionsClient,
  getFragranceOptionsClient,
} from '@/app/services/fragranceOptions.service.client';
import type {
  DictionaryOption,
  FragranceOption,
} from '@/app/types/fragranceTypes';
import { HiddenQueryFields } from '@/app/utils/fragranceFilterForm.utils';
import type { FragranceSearchFormValues } from '@/app/utils/fragranceFilterForm.utils';

type FragranceSearchFormProps = {
  listHref: string;
  defaultValues: FragranceSearchFormValues;
  hiddenValues: Record<string, unknown>;
  resetHref: string;
};

export function FragranceSearchForm({
  listHref,
  defaultValues,
  hiddenValues,
  resetHref,
}: FragranceSearchFormProps) {
  const {
    control,
    register,
    reset,
    watch,
    setValue,
  } = useForm<FragranceSearchFormValues>({
    defaultValues,
  });

  const brand = watch('brand');
  const fragranceName = watch('name');

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <form action={listHref} className={styles.form} method="get">
      <input type="hidden" name="page" value="1" />
      <input type="hidden" {...register('name')} />
      <HiddenQueryFields values={hiddenValues} />

      <div className={styles.formHeader}>
        <div>
          <h2 className={styles.sectionTitle}>РџРѕС€СѓРє Р°СЂРѕРјР°С‚Сѓ</h2>
          <p className={styles.sectionLead}>
            РћР±РµСЂС–С‚СЊ Р±СЂРµРЅРґ, Р·РЅР°Р№РґС–С‚СЊ РєРѕРЅРєСЂРµС‚РЅРёР№ Р°СЂРѕРјР°С‚ Р°Р±Рѕ РІРІРµРґС–С‚СЊ С‡Р°СЃС‚РёРЅСѓ РЅР°Р·РІРё.
          </p>
        </div>
      </div>

      <div className={styles.searchGrid}>
        <Controller
          control={control}
          name="brand"
          render={({ field }) => (
            <RemoteSingleSelect<DictionaryOption>
              name={field.name}
              value={field.value}
              label="Р‘СЂРµРЅРґ"
              placeholder="РџРѕС€СѓРє Р±СЂРµРЅРґСѓ..."
              emptyLabel="РЈСЃС– Р±СЂРµРЅРґРё"
              emptyMessage="Р‘СЂРµРЅРґС–РІ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."
              idleMessage="РџРѕС‡РЅС–С‚СЊ РІРІРѕРґРёС‚Рё РЅР°Р·РІСѓ Р±СЂРµРЅРґСѓ Р°Р±Рѕ РѕР±РµСЂС–С‚СЊ Р±СЂРµРЅРґ Р·С– СЃРїРёСЃРєСѓ."
              loadOnMount
              pageSize={20}
              loadOptions={getBrandOptionsClient}
              onChange={(nextValue) => {
                field.onChange(nextValue);
                setValue('fragrance_id', '');
                setValue('name', '');
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="fragrance_id"
          render={({ field }) => (
            <RemoteSingleSelect<FragranceOption>
              name={field.name}
              value={field.value}
              label="РќР°Р·РІР° Р°СЂРѕРјР°С‚Сѓ"
              placeholder={
                brand
                  ? 'РџРѕС€СѓРє Р°СЂРѕРјР°С‚Сѓ С†СЊРѕРіРѕ Р±СЂРµРЅРґСѓ...'
                  : 'РџРѕС€СѓРє Р°СЂРѕРјР°С‚Сѓ...'
              }
              emptyLabel="РќРµ РѕР±СЂР°РЅРѕ РєРѕРЅРєСЂРµС‚РЅРёР№ Р°СЂРѕРјР°С‚"
              emptyMessage="РђСЂРѕРјР°С‚С–РІ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."
              idleMessage="Р’РІРµРґС–С‚СЊ РјС–РЅС–РјСѓРј 2 СЃРёРјРІРѕР»Рё РґР»СЏ РїРѕС€СѓРєСѓ Р°СЂРѕРјР°С‚Сѓ."
              minSearchLength={2}
              pageSize={20}
              loadOptions={getFragranceOptionsClient}
              extraQuery={brand ? { brand } : undefined}
              searchValue={fragranceName}
              onSearchChange={(nextName) => {
                setValue('name', nextName);

                if (field.value) {
                  field.onChange('');
                }
              }}
              onChange={(nextValue, option) => {
                field.onChange(nextValue);

                if (option) {
                  setValue('name', option.name ?? '');
                  return;
                }

                setValue('name', '');
              }}
            />
          )}
        />

        <label className={styles.field}>
          <span className={styles.label}>Р С–Рє РІС–Рґ</span>
          <input
            {...register('year_from')}
            type="number"
            min={1800}
            className={styles.input}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Р С–Рє РґРѕ</span>
          <input
            {...register('year_to')}
            type="number"
            min={1800}
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submit}>
          Р—Р°СЃС‚РѕСЃСѓРІР°С‚Рё РїРѕС€СѓРє
        </button>

        <Link className={styles.reset} href={resetHref}>
          РћС‡РёСЃС‚РёС‚Рё РїРѕС€СѓРє
        </Link>
      </div>
    </form>
  );
}
