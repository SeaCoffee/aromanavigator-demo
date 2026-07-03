// frontend/src/app/components/users/PublicUserSearchForm.tsx

'use client';

import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import {
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';

import { publicUserStyles as styles } from '@/app/components/users/publicUser.styles';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import {
  cleanParam,
  type SearchParamsRecord,
} from '@/app/utils/searchParamsUtils';

type Props = {
  params: SearchParamsRecord;
  resetHref?: string;
};

const SEARCH_DEBOUNCE_MS = 350;

function normalizeSearchValue(value: string) {
  return value.trim();
}

export default function PublicUserSearchForm({
  params,
  resetHref = userPageUrlBuilder.search(),
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const initialQ = useMemo(() => {
    return cleanParam(params.q) ?? '';
  }, [params.q]);

  const [value, setValue] = useState(initialQ);

  useEffect(() => {
    setValue(initialQ);
  }, [initialQ]);

  useEffect(() => {
    const nextQ = normalizeSearchValue(value);
    const currentQ = normalizeSearchValue(searchParams.get('q') ?? '');

    if (nextQ === currentQ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams.toString());

      nextParams.delete('page');

      if (nextQ) {
        nextParams.set('q', nextQ);
      } else {
        nextParams.delete('q');
      }

      const queryString = nextParams.toString();
      const href = queryString ? `${pathname}?${queryString}` : pathname;

      startTransition(() => {
        router.replace(href, {
          scroll: false,
        });
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, searchParams, pathname, router]);

  return (
    <form role="search" className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="public-users-q" className={styles.label}>
          РџРѕС€СѓРє
        </label>

        <input
          id="public-users-q"
          name="q"
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="@PerfumeFan Р°Р±Рѕ С–РјКјСЏ"
          className={styles.input}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className={styles.actions}>
        {isPending ? (
          <span className={styles.reset}>РЁСѓРєР°С”РјРѕвЂ¦</span>
        ) : null}

        <Link
          href={resetHref}
          className={styles.reset}
          onClick={() => setValue('')}
        >
          РЎРєРёРЅСѓС‚Рё
        </Link>
      </div>
    </form>
  );
}
