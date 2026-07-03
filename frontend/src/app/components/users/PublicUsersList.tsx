// frontend/src/app/components/users/PublicUsersList.tsx

import Link from 'next/link';

import AvatarImage from '@/app/components/images/AvatarImage';
import OnlineBadge from '@/app/components/users/OnlineBadge';
import { OnlineUsersProvider } from '@/app/components/users/OnlineUsersProvider';
import { publicUserStyles as styles } from '@/app/components/users/publicUser.styles';
import type { Query } from '@/app/types/http';
import type { Paginated, PublicUser } from '@/app/types/userTypes';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import {
  buildPageQuery,
  currentPageFromParams,
  type SearchParamsRecord,
} from '@/app/utils/searchParamsUtils';
import {
  getPublicUserDisplayName,
  getUserInitial,
} from '@/app/utils/userDisplayUtils';
import { getRegionLabel } from '@/app/constants/regionOptions';

type SearchHrefBuilder = (query?: Query) => string;

type Props = {
  users: Paginated<PublicUser>;
  params: SearchParamsRecord;
  searchHref?: SearchHrefBuilder;
};

function buildPageHref(
  params: SearchParamsRecord,
  page: number,
  searchHref: SearchHrefBuilder,
) {
  return searchHref(buildPageQuery(params, page));
}

function hasActiveFilterParams(
  params: Record<string, unknown>,
  keys: readonly string[],
) {
  return keys.some((key) => {
    const value = params[key];

    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && String(value).trim() !== '';
  });
}

export default function PublicUsersList({
  users,
  params,
  searchHref = userPageUrlBuilder.search,
}: Props) {
  const currentPage = currentPageFromParams(params);
  const hasPrevious = Boolean(users.previous) && currentPage > 1;
  const hasNext = Boolean(users.next);
  const userIds = users.results.map((user) => user.id);
  const hasActiveSearch = hasActiveFilterParams(params, ['q']);

  return (
    <OnlineUsersProvider userIds={userIds}>
      <section className={styles.list}>
        <div className={styles.listTop}>
          <div>
            <h2 className={styles.sectionTitle}>Р РµР·СѓР»СЊС‚Р°С‚Рё</h2>
            <p className={styles.muted}>
              Р—РЅР°Р№РґРµРЅРѕ: {users.count}
            </p>
          </div>

          <div className={styles.pager}>
            {hasPrevious ? (
              <Link
                href={buildPageHref(params, currentPage - 1, searchHref)}
                className={styles.pagerLink}
              >
                РќР°Р·Р°Рґ
              </Link>
            ) : null}

            {hasNext ? (
              <Link
                href={buildPageHref(params, currentPage + 1, searchHref)}
                className={styles.pagerLink}
              >
                Р”Р°Р»С–
              </Link>
            ) : null}
          </div>
        </div>

        {users.results.length === 0 ? (
          <p className={styles.empty}>
            {hasActiveSearch
              ? 'РљРѕСЂРёСЃС‚СѓРІР°С‡С–РІ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.'
              : 'РџРѕРєРё РЅРµРјР°С” РїСѓР±Р»С–С‡РЅРёС… РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ.'}
          </p>
        ) : (
          <div className={styles.rows}>
            {users.results.map((user) => {
              const displayName = getPublicUserDisplayName(user);
              const href = userPageUrlBuilder.publicProfile(displayName);
              const regionLabel = getRegionLabel(user.profile?.region);

              return (
                <article
                  key={user.id}
                  className={styles.row}
                >
                  <div className={styles.rowUser}>
                    <AvatarImage
                      src={user.profile?.avatar_url}
                      initial={getUserInitial(user)}
                      className={styles.smallAvatar}
                      fallbackClassName={styles.smallAvatarFallback}
                    />

                    <div className={styles.rowInfo}>
                      <div className={styles.nameRow}>
                        <h3 className={styles.rowTitle}>{displayName}</h3>
                        <OnlineBadge userId={user.id} />
                      </div>

                      <p className={styles.rowMeta}>
                        {user.profile?.name ?? 'вЂ”'}
                      </p>
                      {regionLabel ? (
                        <p className={styles.rowSubMeta}>
                          {regionLabel}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <Link
                    href={href}
                    className={styles.pagerLink}
                  >
                    РџСЂРѕС„С–Р»СЊ
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </OnlineUsersProvider>
  );
}
