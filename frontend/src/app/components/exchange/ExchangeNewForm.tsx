'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  createExchangeAction,
  type ExchangeActionResult,
} from '@/app/actions/exchangeActions';
import { exchangeStyles } from '@/app/components/exchange/exchangeStyles';
import { getExchangeItemTypeLabel } from '@/app/components/exchange/exchangeHelpers';
import { meExchangePageUrlBuilder } from '@/app/urls/pageUrls/exchangePageUrlBuilder';
import type {
  ExchangeCreateLimits,
  ExchangeFormItemGroups,
  ExchangeItemPayload,
  ExchangeItemType,
  ExchangeSimpleItem,
} from '@/app/types/exchangeTypes';
import { stringifyJson } from '@/app/utils/valueUtils';

type Props = {
  requestedType: ExchangeItemType;
  requestedId: number;
  ownerId: number;
  itemGroups: ExchangeFormItemGroups;
  limits: ExchangeCreateLimits;
  requested: ExchangeSimpleItem;
};

type FormValues = {
  offer_all: 'true' | 'false';
  message: string;
};

type SelectableItem = {
  type: ExchangeItemType;
  id: number;
  label: string;
  searchText: string;
};

type ItemTypeFilter = 'all' | ExchangeItemType;

const ITEM_TYPE_ORDER: ExchangeItemType[] = ['wardrobe'];

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function buildSearchText(...values: string[]) {
  return normalizeSearch(values.filter(Boolean).join(' '));
}

function buildSelectableItems(
  groups: ExchangeFormItemGroups,
): SelectableItem[] {
  return groups.wardrobe
    .map((item) => {
      const type: ExchangeItemType = 'wardrobe';
      const typeLabel = getExchangeItemTypeLabel(type);
      const title = item.title || `${item.brand} ${item.name}`.trim();
      const label = item.subtitle ? `${title} - ${item.subtitle}` : title;

      return {
        type,
        id: item.id,
        label: `${typeLabel}: ${label}`,
        searchText: buildSearchText(typeLabel, item.brand, item.name, item.subtitle ?? ''),
      };
    })
    .filter((item) => item.id > 0);
}

function itemKey(item: Pick<SelectableItem, 'type' | 'id'>) {
  return `${item.type}:${item.id}`;
}

export default function ExchangeNewForm({
  requestedType,
  requestedId,
  ownerId,
  itemGroups,
  limits,
  requested,
}: Props) {
  const [result, setResult] = useState<ExchangeActionResult | null>(null);
  const [selectedItems, setSelectedItems] = useState<ExchangeItemPayload[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<ItemTypeFilter>('all');

  const items = useMemo(
    () => buildSelectableItems(itemGroups),
    [itemGroups],
  );

  const selectedItemKeys = useMemo(
    () => new Set(selectedItems.map((item) => itemKey(item))),
    [selectedItems],
  );

  const availableTypeFilters = useMemo<ItemTypeFilter[]>(() => {
    const existingTypes = new Set(items.map((item) => item.type));

    return [
      'all',
      ...ITEM_TYPE_ORDER.filter((type) => existingTypes.has(type)),
    ];
  }, [items]);

  const itemSearchQuery = normalizeSearch(itemSearch);

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType =
        itemTypeFilter === 'all' || item.type === itemTypeFilter;

      const matchesSearch =
        !itemSearchQuery || item.searchText.includes(itemSearchQuery);

      return matchesType && matchesSearch;
    });
  }, [items, itemSearchQuery, itemTypeFilter]);

  const maxSelectedItems = limits.max_offered_items;
  const isPendingLimitReached = limits.remaining_pending_to_owner <= 0;

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      offer_all: 'false',
      message: '',
    },
  });

  const offerAll = watch('offer_all') === 'true';

  function toggleItem(item: SelectableItem) {
    setResult(null);
    clearErrors('offer_all');

    setSelectedItems((current) => {
      const key = itemKey(item);
      const exists = current.some((selected) => itemKey(selected) === key);

      if (exists) {
        return current.filter((selected) => itemKey(selected) !== key);
      }

      if (current.length >= maxSelectedItems) {
        setError('offer_all', {
          type: 'manual',
          message: `Р’ РѕРґРЅС–Р№ РїСЂРѕРїРѕР·РёС†С–С— РјРѕР¶РЅР° РѕР±СЂР°С‚Рё РјР°РєСЃРёРјСѓРј ${maxSelectedItems} РїРѕР·РёС†С–Р№.`,
        });

        return current;
      }

      return [...current, { type: item.type, id: item.id }];
    });
  }

  function clearSelectedItems() {
    setResult(null);
    clearErrors('offer_all');
    setSelectedItems([]);
  }

  async function onSubmit(values: FormValues) {
    setResult(null);
    clearErrors('offer_all');

    const submitOfferAll = values.offer_all === 'true';

    if (isPendingLimitReached) {
      setResult({
        ok: false,
        msg:
          `РЈ РІР°СЃ СѓР¶Рµ С” ${limits.max_pending_per_owner} РЅРµРѕР±СЂРѕР±Р»РµРЅС– РїСЂРѕРїРѕР·РёС†С–С— ` +
          'С†СЊРѕРјСѓ РєРѕСЂРёСЃС‚СѓРІР°С‡РµРІС–. Р”РѕС‡РµРєР°Р№С‚РµСЃСЏ РІС–РґРїРѕРІС–РґС– Р°Р±Рѕ СЃРєР°СЃСѓР№С‚Рµ РѕРґРЅСѓ Р· РЅРёС….',
      });

      return;
    }

    if (!submitOfferAll && selectedItems.length === 0) {
      setError('offer_all', {
        type: 'manual',
        message:
          'РћР±РµСЂС–С‚СЊ РїРѕР·РёС†С–С— РґР»СЏ РѕР±РјС–РЅСѓ Р°Р±Рѕ РґРѕР·РІРѕР»СЊС‚Рµ РІР»Р°СЃРЅРёРєСѓ РІРёР±СЂР°С‚Рё СЃРµСЂРµРґ СѓСЃС–С… РІР°С€РёС… РѕРіРѕР»РѕС€РµРЅСЊ.',
      });

      return;
    }

    if (!submitOfferAll && selectedItems.length > maxSelectedItems) {
      setError('offer_all', {
        type: 'manual',
        message: `Р’ РѕРґРЅС–Р№ РїСЂРѕРїРѕР·РёС†С–С— РјРѕР¶РЅР° РѕР±СЂР°С‚Рё РјР°РєСЃРёРјСѓРј ${maxSelectedItems} РїРѕР·РёС†С–Р№.`,
      });

      return;
    }

    const formData = new FormData();

    formData.set('requested_type', requestedType);
    formData.set('requested_id', String(requestedId));
    formData.set('owner_id', String(ownerId));
    formData.set('offer_all', values.offer_all);
    formData.set('message', values.message.trim());
    formData.set(
      'offered_items',
      stringifyJson(submitOfferAll ? [] : selectedItems),
    );

    const actionResult = await createExchangeAction(null, formData);

    setResult(actionResult);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={exchangeStyles.form}>
      <div>
        <h2 className={exchangeStyles.formTitle}>Р—Р°РїСЂРѕРїРѕРЅСѓРІР°С‚Рё РѕР±РјС–РЅ</h2>

        <p className={exchangeStyles.formHint}>
          Р’Рё РїСЂРѕРїРѕРЅСѓС”С‚Рµ РѕР±РјС–РЅ РЅР°{' '}
          <strong>{requested.title || `${requested.brand} ${requested.name}`.trim()}</strong>.
        </p>

        {isPendingLimitReached ? (
          <p className={exchangeStyles.error}>
            РЈ РІР°СЃ СѓР¶Рµ С” {limits.max_pending_per_owner} РЅРµРѕР±СЂРѕР±Р»РµРЅС– РїСЂРѕРїРѕР·РёС†С–С—
            С†СЊРѕРјСѓ РєРѕСЂРёСЃС‚СѓРІР°С‡РµРІС–. Р”РѕС‡РµРєР°Р№С‚РµСЃСЏ РІС–РґРїРѕРІС–РґС– Р°Р±Рѕ СЃРєР°СЃСѓР№С‚Рµ РѕРґРЅСѓ Р· РЅРёС….
          </p>
        ) : limits.pending_to_owner_count > 0 ? (
          <p className={exchangeStyles.formHint}>
            РЈ РІР°СЃ СѓР¶Рµ С” {limits.pending_to_owner_count} /{' '}
            {limits.max_pending_per_owner} РЅРµРѕР±СЂРѕР±Р»РµРЅС– РїСЂРѕРїРѕР·РёС†С–С— С†СЊРѕРјСѓ
            РєРѕСЂРёСЃС‚СѓРІР°С‡РµРІС–.
          </p>
        ) : null}
      </div>

      <fieldset
        className={exchangeStyles.fieldset}
        disabled={isSubmitting || isPendingLimitReached}
      >
        <legend className={exchangeStyles.legend}>Р©Рѕ РІРё РїСЂРѕРїРѕРЅСѓС”С‚Рµ?</legend>

        <label className={exchangeStyles.radioLabel}>
          <input type="radio" value="false" {...register('offer_all')} />
          <span>РћР±СЂР°С‚Рё РєРѕРЅРєСЂРµС‚РЅС– РїРѕР·РёС†С–С—</span>
        </label>

        <label className={exchangeStyles.radioLabel}>
          <input type="radio" value="true" {...register('offer_all')} />
          <span>Р”Р°С‚Рё РІР»Р°СЃРЅРёРєСѓ РІРёР±СЂР°С‚Рё СЃРµСЂРµРґ СѓСЃС–С… РјРѕС—С… РїРѕР·РёС†С–Р№</span>
        </label>

        {errors.offer_all?.message ? (
          <p className={exchangeStyles.error}>{errors.offer_all.message}</p>
        ) : null}
      </fieldset>

      {!offerAll ? (
        <section className={exchangeStyles.selectorSection}>
          <div>
            <h3 className={exchangeStyles.selectorTitle}>
              РњРѕС— РїРѕР·РёС†С–С— РґР»СЏ РѕР±РјС–РЅСѓ
            </h3>

            <p className={exchangeStyles.selectorHint}>
              РњРѕР¶РЅР° РІРёР±СЂР°С‚Рё РґРѕ {maxSelectedItems} РїРѕР·РёС†С–Р№.
            </p>

            {selectedItems.length ? (
              <div className={exchangeStyles.selectedSummary}>
                <span>
                  РћР±СЂР°РЅРѕ: {selectedItems.length} / {maxSelectedItems}
                </span>

                <button
                  type="button"
                  disabled={isSubmitting || isPendingLimitReached}
                  onClick={clearSelectedItems}
                  className={exchangeStyles.clearSelectionButton}
                >
                  РћС‡РёСЃС‚РёС‚Рё РІРёР±С–СЂ
                </button>
              </div>
            ) : null}
          </div>

          {items.length ? (
            <div className={exchangeStyles.selectorSection}>
              <div className={exchangeStyles.selectorControls}>
                <input
                  type="search"
                  value={itemSearch}
                  disabled={isSubmitting || isPendingLimitReached}
                  onChange={(event) => setItemSearch(event.target.value)}
                  placeholder="РџРѕС€СѓРє Р·Р° Р±СЂРµРЅРґРѕРј Р°Р±Рѕ РЅР°Р·РІРѕСЋ"
                  className={exchangeStyles.searchInput}
                />

                {availableTypeFilters.length > 2 ? (
                  <div className={exchangeStyles.typeFilters}>
                    {availableTypeFilters.map((type) => {
                      const isActive = itemTypeFilter === type;

                      const label =
                        type === 'all'
                          ? 'РЈСЃС–'
                          : getExchangeItemTypeLabel(type);

                      return (
                        <button
                          key={type}
                          type="button"
                          disabled={isSubmitting || isPendingLimitReached}
                          onClick={() => setItemTypeFilter(type)}
                          className={[
                            exchangeStyles.typeFilterButton,
                            isActive
                              ? exchangeStyles.typeFilterButtonActive
                              : exchangeStyles.typeFilterButtonIdle,
                          ].join(' ')}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              {visibleItems.length ? (
                <div className={exchangeStyles.scrollList}>
                  <div className={exchangeStyles.itemList}>
                    {visibleItems.map((item) => {
                      const key = itemKey(item);
                      const checked = selectedItemKeys.has(key);

                      const limitReached =
                        !checked && selectedItems.length >= maxSelectedItems;

                      return (
                        <label
                          key={key}
                          className={[
                            exchangeStyles.itemLabel,
                            checked
                              ? exchangeStyles.itemLabelChecked
                              : exchangeStyles.itemLabelIdle,
                            limitReached
                              ? exchangeStyles.itemLabelDisabled
                              : exchangeStyles.itemLabelEnabled,
                          ].join(' ')}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={
                              isSubmitting ||
                              isPendingLimitReached ||
                              limitReached
                            }
                            onChange={() => toggleItem(item)}
                          />

                          <span>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className={exchangeStyles.empty}>
                  Р—Р° С†РёРј РїРѕС€СѓРєРѕРј РЅРµРјР°С” РїРѕР·РёС†С–Р№.
                </p>
              )}
            </div>
          ) : (
            <p className={exchangeStyles.empty}>
              РЈ РІР°С€РёС… РѕРіРѕР»РѕС€РµРЅРЅСЏС… РЅРµРјР°С” Р°РєС‚РёРІРЅРёС… РїРѕР·РёС†С–Р№ РґР»СЏ РѕР±РјС–РЅСѓ.
            </p>
          )}
        </section>
      ) : null}

      <textarea
        {...register('message')}
        disabled={isSubmitting || isPendingLimitReached}
        className={exchangeStyles.textarea}
        placeholder="РќР°РїРёС€С–С‚СЊ РєРѕРјРµРЅС‚Р°СЂ. РЇРєС‰Рѕ Р±СѓРґРµ РґРѕРїР»Р°С‚Р°, РІРєР°Р¶С–С‚СЊ С—С— СЂРѕР·РјС–СЂ Р°Р±Рѕ С–РЅС€С– РЅСЋР°РЅСЃРё С‚СѓС‚."
      />

      {result?.msg ? (
        <p className={result.ok ? exchangeStyles.success : exchangeStyles.error}>
          {result.msg}
        </p>
      ) : null}

      <div className={exchangeStyles.cardActions}>
        <button
          type="submit"
          disabled={isSubmitting || isPendingLimitReached}
          className={`${exchangeStyles.button} ${exchangeStyles.buttonPrimary}`}
        >
          {isSubmitting ? 'РќР°РґСЃРёР»Р°С”РјРѕ...' : 'РќР°РґС–СЃР»Р°С‚Рё РїСЂРѕРїРѕР·РёС†С–СЋ'}
        </button>

        <Link
          href={meExchangePageUrlBuilder.received()}
          className={`${exchangeStyles.button} ${exchangeStyles.buttonSecondary}`}
        >
          Р”Рѕ РѕР±РјС–РЅС–РІ
        </Link>
      </div>
    </form>
  );
}
