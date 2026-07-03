'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { RemoteMultiSelect } from '@/app/components/fragrances/RemoteOptionSelect';
import { fragranceFilterStyles as styles } from '@/app/components/fragrances/fragranceEncyclopedia.styles';
import {
  getFamilyOptionsClient,
  getNoteOptionsClient,
  getPerfumerOptionsClient,
} from '@/app/services/fragranceOptions.service.client';
import type { DictionaryOption } from '@/app/types/fragranceTypes';
import { HiddenQueryFields } from '@/app/utils/fragranceFilterForm.utils';
import type { BuilderFilterFormValues } from '@/app/utils/fragranceFilterForm.utils';

type FragranceBuilderFilterFormProps = {
  listHref: string;
  defaultValues: BuilderFilterFormValues;
  hiddenValues: Record<string, unknown>;
  resetHref: string;
};

export function FragranceBuilderFilterForm({
  listHref,
  defaultValues,
  hiddenValues,
  resetHref,
}: FragranceBuilderFilterFormProps) {
  const { control, register, reset } = useForm<BuilderFilterFormValues>({
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <form action={listHref} className={styles.form} method="get">
      <input type="hidden" name="page" value="1" />
      <HiddenQueryFields values={hiddenValues} />

      <section className={styles.builder}>
        <div className={styles.builderHeader}>
          <h2 className={styles.builderTitle}>РџС–РґС–Р±СЂР°С‚Рё Р°СЂРѕРјР°С‚</h2>
          <p className={styles.builderLead}>
            РџРѕС”РґРЅСѓР№С‚Рµ СЃС–РјРµР№СЃС‚РІР°, РЅРѕС‚Рё Р№ РїР°СЂС„СѓРјРµСЂС–РІ. РЇРєС‰Рѕ РѕР±СЂР°С‚Рё РєС–Р»СЊРєР° Р·РЅР°С‡РµРЅСЊ,
            Р°СЂРѕРјР°С‚ РјР°С” РІС–РґРїРѕРІС–РґР°С‚Рё РІСЃС–Рј РѕР±СЂР°РЅРёРј РїР°СЂР°РјРµС‚СЂР°Рј.
          </p>
        </div>

        <div className={styles.builderGrid}>
          <Controller
            control={control}
            name="family"
            render={({ field }) => (
              <RemoteMultiSelect<DictionaryOption>
                name={field.name}
                value={field.value}
                label="РЎС–РјРµР№СЃС‚РІР°"
                placeholder="РџРѕС€СѓРє СЃС–РјРµР№СЃС‚РІР°..."
                emptyMessage="РЎС–РјРµР№СЃС‚РІ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."
                idleMessage="РћР±РµСЂС–С‚СЊ СЃС–РјРµР№СЃС‚РІРѕ Р·С– СЃРїРёСЃРєСѓ Р°Р±Рѕ СЃРєРѕСЂРёСЃС‚Р°Р№С‚РµСЃСЏ РїРѕС€СѓРєРѕРј."
                loadOnMount
                pageSize={20}
                loadOptions={getFamilyOptionsClient}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="note"
            render={({ field }) => (
              <RemoteMultiSelect<DictionaryOption>
                name={field.name}
                value={field.value}
                label="РќРѕС‚Рё"
                placeholder="РџРѕС€СѓРє РЅРѕС‚Рё..."
                emptyMessage="РќРѕС‚ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."
                idleMessage="РћР±РµСЂС–С‚СЊ РЅРѕС‚Сѓ Р·С– СЃРїРёСЃРєСѓ Р°Р±Рѕ СЃРєРѕСЂРёСЃС‚Р°Р№С‚РµСЃСЏ РїРѕС€СѓРєРѕРј."
                loadOnMount
                pageSize={20}
                loadOptions={getNoteOptionsClient}
                onChange={field.onChange}
              />
            )}
          />

          <label className={styles.field}>
            <span className={styles.label}>Р С–РІРµРЅСЊ РЅРѕС‚</span>
            <select {...register('note_level')} className={styles.input}>
              <option value="">Р‘СѓРґСЊ-СЏРєРёР№ СЂС–РІРµРЅСЊ</option>
              <option value="top">Р’РµСЂС…РЅС–</option>
              <option value="heart">РЎРµСЂС†Рµ</option>
              <option value="base">Р‘Р°Р·Р°</option>
            </select>
          </label>

          <Controller
            control={control}
            name="perfumer"
            render={({ field }) => (
              <RemoteMultiSelect<DictionaryOption>
                name={field.name}
                value={field.value}
                label="РџР°СЂС„СѓРјРµСЂРё"
                placeholder="РџРѕС€СѓРє РїР°СЂС„СѓРјРµСЂР°..."
                emptyMessage="РџР°СЂС„СѓРјРµСЂС–РІ РЅРµ Р·РЅР°Р№РґРµРЅРѕ."
                idleMessage="РћР±РµСЂС–С‚СЊ РїР°СЂС„СѓРјРµСЂР° Р·С– СЃРїРёСЃРєСѓ Р°Р±Рѕ СЃРєРѕСЂРёСЃС‚Р°Р№С‚РµСЃСЏ РїРѕС€СѓРєРѕРј."
                loadOnMount
                pageSize={20}
                loadOptions={getPerfumerOptionsClient}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      </section>

      <div className={styles.actions}>
        <button type="submit" className={styles.submit}>
          РџС–РґС–Р±СЂР°С‚Рё
        </button>

        <Link className={styles.reset} href={resetHref}>
          РћС‡РёСЃС‚РёС‚Рё РїС–РґР±С–СЂ
        </Link>
      </div>
    </form>
  );
}
