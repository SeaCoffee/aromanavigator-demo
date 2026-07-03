'use client';

import type { UIEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { fragranceFilterStyles as styles } from '@/app/components/fragrances/fragranceEncyclopedia.styles';
import type { Paginated, Query } from '@/app/types/http';

type OptionId = string | number;

export type RemoteOptionBase = {
  id: OptionId;
  label: string;
  name?: string;
};

type LoadOptionsQuery = Query & {
  search?: string;
  ids?: string;
  page?: number;
  page_size?: number;
  brand?: string | number;
};

type LoadOptions<TOption extends RemoteOptionBase> = (
  query?: LoadOptionsQuery,
) => Promise<Paginated<TOption>>;

type RemoteSingleSelectProps<TOption extends RemoteOptionBase> = {
  name?: string;
  value: string;
  label: string;
  placeholder: string;
  emptyLabel: string;
  emptyMessage: string;
  loadOptions: LoadOptions<TOption>;
  extraQuery?: LoadOptionsQuery;
  disabled?: boolean;
  pageSize?: number;
  searchValue?: string;
  loadOnMount?: boolean;
  minSearchLength?: number;
  idleMessage?: string;
  onSearchChange?: (value: string) => void;
  onChange: (value: string, option?: TOption) => void;
};

type RemoteMultiSelectProps<TOption extends RemoteOptionBase> = {
  name?: string;
  value: string[];
  label: string;
  placeholder: string;
  emptyMessage: string;
  loadOptions: LoadOptions<TOption>;
  extraQuery?: LoadOptionsQuery;
  disabled?: boolean;
  pageSize?: number;
  loadOnMount?: boolean;
  minSearchLength?: number;
  idleMessage?: string;
  onChange: (value: string[]) => void;
};

function toOptionValue(value: OptionId) {
  return String(value);
}

function uniqOptions<TOption extends RemoteOptionBase>(
  options: TOption[],
): TOption[] {
  const seen = new Set<string>();

  return options.filter((option) => {
    const value = toOptionValue(option.id);

    if (seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
}

function parseExtraQuery(extraQueryKey: string): LoadOptionsQuery {
  try {
    return JSON.parse(extraQueryKey) as LoadOptionsQuery;
  } catch {
    return {};
  }
}

function useDebouncedValue(value: string, delayMs = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}

function pageHasMore<TOption>(
  page: Paginated<TOption>,
  pageNumber: number,
  pageSize: number,
) {
  const meta = page as Paginated<TOption> & {
    next?: unknown;
    total_pages?: unknown;
    count?: unknown;
    total_items?: unknown;
  };

  if (typeof meta.next === 'boolean') {
    return meta.next;
  }

  if (typeof meta.next === 'string') {
    return Boolean(meta.next);
  }

  if (typeof meta.total_pages === 'number') {
    return pageNumber < meta.total_pages;
  }

  if (typeof meta.count === 'number') {
    return pageNumber * pageSize < meta.count;
  }

  if (typeof meta.total_items === 'number') {
    return pageNumber * pageSize < meta.total_items;
  }

  return page.results.length >= pageSize;
}

function isNearBottom(element: HTMLDivElement) {
  return element.scrollTop + element.clientHeight >= element.scrollHeight - 32;
}

function shouldLoadOptions({
  searchValue,
  loadOnMount,
  minSearchLength,
}: {
  searchValue: string;
  loadOnMount: boolean;
  minSearchLength: number;
}) {
  if (loadOnMount) {
    return true;
  }

  return searchValue.trim().length >= minSearchLength;
}

function getIdleMessage({
  idleMessage,
  minSearchLength,
}: {
  idleMessage?: string;
  minSearchLength: number;
}) {
  if (idleMessage) {
    return idleMessage;
  }

  if (minSearchLength > 1) {
    return `Р’РІРµРґС–С‚СЊ РјС–РЅС–РјСѓРј ${minSearchLength} СЃРёРјРІРѕР»Рё РґР»СЏ РїРѕС€СѓРєСѓ.`;
  }

  return 'РџРѕС‡РЅС–С‚СЊ РІРІРѕРґРёС‚Рё РґР»СЏ РїРѕС€СѓРєСѓ.';
}

function useRemoteOptions<TOption extends RemoteOptionBase>({
  valueIds,
  searchValue,
  loadOptions,
  extraQuery,
  pageSize = 20,
  shouldLoadSearchOptions,
}: {
  valueIds: string[];
  searchValue: string;
  loadOptions: LoadOptions<TOption>;
  extraQuery?: LoadOptionsQuery;
  pageSize?: number;
  shouldLoadSearchOptions: boolean;
}) {
  const [searchOptions, setSearchOptions] = useState<TOption[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<TOption[]>([]);

  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearchOptions, setHasMoreSearchOptions] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);

  const debouncedSearchValue = useDebouncedValue(searchValue);
  const extraQueryKey = JSON.stringify(extraQuery ?? {});
  const valueIdsKey = valueIds.filter(Boolean).join(',');

  useEffect(() => {
    if (!shouldLoadSearchOptions) {
      setSearchOptions([]);
      setSearchPage(1);
      setHasMoreSearchOptions(false);
      setIsLoading(false);
      setIsLoadingMore(false);
      setHasError(false);
      return;
    }

    let isCurrent = true;

    setIsLoading(true);
    setHasError(false);
    setSearchPage(1);
    setHasMoreSearchOptions(false);

    loadOptions({
      ...parseExtraQuery(extraQueryKey),
      search: debouncedSearchValue.trim(),
      page: 1,
      page_size: pageSize,
    })
      .then((page) => {
        if (!isCurrent) {
          return;
        }

        setSearchOptions(uniqOptions(page.results));
        setHasMoreSearchOptions(pageHasMore(page, 1, pageSize));
      })
      .catch(() => {
        if (!isCurrent) {
          return;
        }

        setSearchOptions([]);
        setHasMoreSearchOptions(false);
        setHasError(true);
      })
      .finally(() => {
        if (!isCurrent) {
          return;
        }

        setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [
    debouncedSearchValue,
    extraQueryKey,
    loadOptions,
    pageSize,
    shouldLoadSearchOptions,
  ]);

  useEffect(() => {
    if (!valueIdsKey) {
      setSelectedOptions([]);
      return;
    }

    let isCurrent = true;

    loadOptions({
      ids: valueIdsKey,
      page_size: valueIds.length || pageSize,
    })
      .then((page) => {
        if (!isCurrent) {
          return;
        }

        setSelectedOptions(page.results);
      })
      .catch(() => {
        if (!isCurrent) {
          return;
        }

        setSelectedOptions([]);
      });

    return () => {
      isCurrent = false;
    };
  }, [loadOptions, pageSize, valueIds.length, valueIdsKey]);

  function loadMoreSearchOptions() {
    if (
      isLoading ||
      isLoadingMore ||
      hasError ||
      !hasMoreSearchOptions ||
      !shouldLoadSearchOptions
    ) {
      return;
    }

    const nextPage = searchPage + 1;

    setIsLoadingMore(true);

    loadOptions({
      ...parseExtraQuery(extraQueryKey),
      search: debouncedSearchValue.trim(),
      page: nextPage,
      page_size: pageSize,
    })
      .then((page) => {
        setSearchOptions((currentOptions) =>
          uniqOptions([...currentOptions, ...page.results]),
        );
        setSearchPage(nextPage);
        setHasMoreSearchOptions(pageHasMore(page, nextPage, pageSize));
      })
      .catch(() => {
        setHasMoreSearchOptions(false);
        setHasError(true);
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  }

  return {
    isLoading,
    isLoadingMore,
    hasError,
    searchOptions,
    selectedOptions,
    hasMoreSearchOptions,
    loadMoreSearchOptions,
  };
}

export function RemoteSingleSelect<TOption extends RemoteOptionBase>({
  name,
  value,
  label,
  placeholder,
  emptyLabel,
  emptyMessage,
  loadOptions,
  extraQuery,
  disabled = false,
  pageSize = 20,
  searchValue,
  loadOnMount = false,
  minSearchLength = 1,
  idleMessage,
  onSearchChange,
  onChange,
}: RemoteSingleSelectProps<TOption>) {
  const [internalSearchValue, setInternalSearchValue] = useState('');

  const currentSearchValue = searchValue ?? internalSearchValue;
  const shouldLoadSearchOptions = shouldLoadOptions({
    searchValue: currentSearchValue,
    loadOnMount,
    minSearchLength,
  });

  const {
    isLoading,
    isLoadingMore,
    hasError,
    searchOptions,
    selectedOptions,
    hasMoreSearchOptions,
    loadMoreSearchOptions,
  } = useRemoteOptions({
    valueIds: value ? [value] : [],
    searchValue: currentSearchValue,
    loadOptions,
    extraQuery,
    pageSize,
    shouldLoadSearchOptions,
  });

  const selectedOption = useMemo(() => {
    if (!value) {
      return undefined;
    }

    return uniqOptions([...selectedOptions, ...searchOptions]).find(
      (option) => toOptionValue(option.id) === value,
    );
  }, [searchOptions, selectedOptions, value]);

  function setSearchValue(nextValue: string) {
    setInternalSearchValue(nextValue);
    onSearchChange?.(nextValue);
  }

  function clearValue() {
    onChange('');
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    if (disabled) {
      return;
    }

    if (isNearBottom(event.currentTarget)) {
      loadMoreSearchOptions();
    }
  }

  function renderMessage() {
    const hasUserSearch = currentSearchValue.trim().length >= minSearchLength;

    if (!shouldLoadSearchOptions) {
      return getIdleMessage({ idleMessage, minSearchLength });
    }

    if (isLoading) {
      return 'РЁСѓРєР°С”РјРѕ...';
    }

    if (hasError) {
      return 'РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё СЃРїРёСЃРѕРє.';
    }

    if (!hasUserSearch) {
      return getIdleMessage({ idleMessage, minSearchLength });
    }

    return emptyMessage;
  }

  return (
    <div className={styles.remoteSelect}>
      {name ? <input type="hidden" name={name} value={value} /> : null}

      <div className={styles.remoteSelectTop}>
        <span className={styles.remoteSelectTitle}>{label}</span>

        {selectedOption ? (
          <button
            type="button"
            className={styles.chip}
            disabled={disabled}
            onClick={clearValue}
          >
            {selectedOption.label} Г—
          </button>
        ) : null}
      </div>

      <input
        type="search"
        aria-label={label}
        value={currentSearchValue}
        placeholder={placeholder}
        className={styles.input}
        disabled={disabled}
        onChange={(event) => setSearchValue(event.target.value)}
      />

      <div
        className={styles.optionList}
        role="listbox"
        aria-label={`${label}: РІР°СЂС–Р°РЅС‚Рё`}
        onScroll={handleScroll}
      >
        <button
          type="button"
          className={!value ? styles.optionButtonActive : styles.optionButton}
          disabled={disabled}
          onClick={clearValue}
        >
          {emptyLabel}
        </button>

        {searchOptions.length ? (
          <>
            {searchOptions.map((option) => {
              const optionValue = toOptionValue(option.id);
              const isSelected = optionValue === value;

              return (
                <button
                  key={optionValue}
                  type="button"
                  className={
                    isSelected ? styles.optionButtonActive : styles.optionButton
                  }
                  disabled={disabled}
                  onClick={() => onChange(optionValue, option)}
                >
                  {option.label}
                </button>
              );
            })}

            {isLoadingMore ? (
              <div className={styles.optionEmpty}>Р—Р°РІР°РЅС‚Р°Р¶СѓС”РјРѕ С‰Рµ...</div>
            ) : null}

            {!isLoadingMore && hasMoreSearchOptions ? (
              <div className={styles.optionEmpty}>
                РџСЂРѕРєСЂСѓС‚С–С‚СЊ РЅРёР¶С‡Рµ, С‰РѕР± Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё С‰Рµ.
              </div>
            ) : null}
          </>
        ) : (
          <div className={styles.optionEmpty}>{renderMessage()}</div>
        )}
      </div>
    </div>
  );
}

export function RemoteMultiSelect<TOption extends RemoteOptionBase>({
  name,
  value,
  label,
  placeholder,
  emptyMessage,
  loadOptions,
  extraQuery,
  disabled = false,
  pageSize = 20,
  loadOnMount = false,
  minSearchLength = 1,
  idleMessage,
  onChange,
}: RemoteMultiSelectProps<TOption>) {
  const [searchValue, setSearchValue] = useState('');
  const shouldLoadSearchOptions = shouldLoadOptions({
    searchValue,
    loadOnMount,
    minSearchLength,
  });

  const selectedValues = useMemo(() => new Set(value), [value]);

  const {
    isLoading,
    isLoadingMore,
    hasError,
    searchOptions,
    selectedOptions: loadedSelectedOptions,
    hasMoreSearchOptions,
    loadMoreSearchOptions,
  } = useRemoteOptions({
    valueIds: value,
    searchValue,
    loadOptions,
    extraQuery,
    pageSize,
    shouldLoadSearchOptions,
  });

  const selectedOptions = useMemo(() => {
    return uniqOptions([...loadedSelectedOptions, ...searchOptions]).filter(
      (option) => selectedValues.has(toOptionValue(option.id)),
    );
  }, [loadedSelectedOptions, searchOptions, selectedValues]);

  function toggleValue(nextValue: string) {
    if (selectedValues.has(nextValue)) {
      onChange(value.filter((item) => item !== nextValue));
      return;
    }

    onChange([...value, nextValue]);
  }

  function removeValue(nextValue: string) {
    onChange(value.filter((item) => item !== nextValue));
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    if (disabled) {
      return;
    }

    if (isNearBottom(event.currentTarget)) {
      loadMoreSearchOptions();
    }
  }

  function renderMessage() {
    const hasUserSearch = searchValue.trim().length >= minSearchLength;

    if (!shouldLoadSearchOptions) {
      return getIdleMessage({ idleMessage, minSearchLength });
    }

    if (isLoading) {
      return 'РЁСѓРєР°С”РјРѕ...';
    }

    if (hasError) {
      return 'РќРµ РІРґР°Р»РѕСЃСЏ Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё СЃРїРёСЃРѕРє.';
    }

    if (!hasUserSearch) {
      return getIdleMessage({ idleMessage, minSearchLength });
    }

    return emptyMessage;
  }

  return (
    <div className={styles.remoteSelect}>
      {name
        ? value.map((item) => (
            <input key={item} type="hidden" name={name} value={item} />
          ))
        : null}

      <div className={styles.remoteSelectTop}>
        <span className={styles.remoteSelectTitle}>{label}</span>
      </div>

      {selectedOptions.length ? (
        <div className={styles.chips}>
          {selectedOptions.map((option) => {
            const optionValue = toOptionValue(option.id);

            return (
              <button
                key={optionValue}
                type="button"
                className={styles.chip}
                disabled={disabled}
                onClick={() => removeValue(optionValue)}
              >
                {option.label} Г—
              </button>
            );
          })}
        </div>
      ) : null}

      <input
        type="search"
        aria-label={label}
        value={searchValue}
        placeholder={placeholder}
        className={styles.input}
        disabled={disabled}
        onChange={(event) => setSearchValue(event.target.value)}
      />

      <div
        className={styles.optionList}
        role="listbox"
        aria-label={`${label}: РІР°СЂС–Р°РЅС‚Рё`}
        aria-multiselectable="true"
        onScroll={handleScroll}
      >
        {searchOptions.length ? (
          <>
            {searchOptions.map((option) => {
              const optionValue = toOptionValue(option.id);
              const isSelected = selectedValues.has(optionValue);

              return (
                <label
                  key={optionValue}
                  className={
                    isSelected ? styles.optionButtonActive : styles.optionButton
                  }
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() => toggleValue(optionValue)}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}

            {isLoadingMore ? (
              <div className={styles.optionEmpty}>Р—Р°РІР°РЅС‚Р°Р¶СѓС”РјРѕ С‰Рµ...</div>
            ) : null}

            {!isLoadingMore && hasMoreSearchOptions ? (
              <div className={styles.optionEmpty}>
                РџСЂРѕРєСЂСѓС‚С–С‚СЊ РЅРёР¶С‡Рµ, С‰РѕР± Р·Р°РІР°РЅС‚Р°Р¶РёС‚Рё С‰Рµ.
              </div>
            ) : null}
          </>
        ) : (
          <div className={styles.optionEmpty}>{renderMessage()}</div>
        )}
      </div>
    </div>
  );
}
