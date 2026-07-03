// frontend/src/app/components/wardrobe/WardrobeListToolbar.tsx

'use client';

import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  WARDROBE_DEFAULT_ORDERING,
  WARDROBE_ORDERING_OPTIONS,
  WARDROBE_STATUS_OPTIONS,
} from '@/app/components/wardrobe/wardrobeConstants';
import { wardrobeStyles as s } from '@/app/components/wardrobe/wardrobe.styles';
import type { WardrobeListQuery } from '@/app/types/wardrobeTypes';

type Props = {
  action: string;
  query: WardrobeListQuery;
};

type QueryPatch = {
  q?: string | null;
  status?: string | null;
  ordering?: string | null;
};

const SEARCH_DEBOUNCE_MS = 350;

function normalizeValue(value: unknown) {
  return String(value ?? '').trim();
}

function buildToolbarHref(
  action: string,
  currentParams: URLSearchParams,
  patch: QueryPatch,
) {
  const nextParams = new URLSearchParams(currentParams.toString());

  nextParams.delete('page');

  Object.entries(patch).forEach(([key, value]) => {
    const normalizedValue = normalizeValue(value);

    if (!normalizedValue) {
      nextParams.delete(key);
      return;
    }

    if (key === 'ordering' && normalizedValue === WARDROBE_DEFAULT_ORDERING) {
      nextParams.delete(key);
      return;
    }

    nextParams.set(key, normalizedValue);
  });

  const queryString = nextParams.toString();

  return queryString ? `${action}?${queryString}` : action;
}

export default function WardrobeListToolbar({ action, query }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialSearch = useMemo(() => {
    return normalizeValue(query.q ?? query.search ?? '');
  }, [query.q, query.search]);

  const initialStatus = useMemo(() => {
    return normalizeValue(query.status ?? '');
  }, [query.status]);

  const initialOrdering = useMemo(() => {
    return normalizeValue(query.ordering ?? WARDROBE_DEFAULT_ORDERING);
  }, [query.ordering]);

  const [searchValue, setSearchValue] = useState(initialSearch);
  const [statusValue, setStatusValue] = useState(initialStatus);
  const [orderingValue, setOrderingValue] = useState(initialOrdering);

  useEffect(() => {
    setSearchValue(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setStatusValue(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    setOrderingValue(initialOrdering);
  }, [initialOrdering]);

  useEffect(() => {
    const nextQ = normalizeValue(searchValue);
    const currentQ = normalizeValue(searchParams.get('q') ?? '');

    if (nextQ === currentQ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const href = buildToolbarHref(
        action,
        new URLSearchParams(searchParams.toString()),
        {
          q: nextQ || null,
        },
      );

      startTransition(() => {
        router.replace(href, {
          scroll: false,
        });
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [action, router, searchParams, searchValue]);

  function replaceQuery(patch: QueryPatch) {
    const href = buildToolbarHref(
      action,
      new URLSearchParams(searchParams.toString()),
      patch,
    );

    startTransition(() => {
      router.replace(href, {
        scroll: false,
      });
    });
  }

  function changeStatus(value: string) {
    setStatusValue(value);
    replaceQuery({
      status: value || null,
    });
  }

  function changeOrdering(value: string) {
    setOrderingValue(value);
    replaceQuery({
      ordering: value || null,
    });
  }

  function resetFilters() {
    setSearchValue('');
    setStatusValue('');
    setOrderingValue(WARDROBE_DEFAULT_ORDERING);
  }

  return (
    <div className={s.toolbar}>
      <form role="search" className={s.toolbarForm}>
        <input
          name="q"
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="РџРѕС€СѓРє Р·Р° Р±СЂРµРЅРґРѕРј Р°Р±Рѕ Р°СЂРѕРјР°С‚РѕРј"
          className={s.input}
          autoComplete="off"
          spellCheck={false}
        />

        <select
          name="status"
          value={statusValue}
          onChange={(event) => changeStatus(event.target.value)}
          className={s.select}
        >
          <option value="">РЈСЃС– СЃС‚Р°С‚СѓСЃРё</option>

          {WARDROBE_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          name="ordering"
          value={orderingValue}
          onChange={(event) => changeOrdering(event.target.value)}
          className={s.select}
        >
          {WARDROBE_ORDERING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {isPending ? (
          <span className={s.resetLink}>РћРЅРѕРІР»СЋС”РјРѕвЂ¦</span>
        ) : null}

        <Link
          href={action}
          className={s.resetLink}
          onClick={resetFilters}
        >
          РЎРєРёРЅСѓС‚Рё
        </Link>
      </form>
    </div>
  );
}
