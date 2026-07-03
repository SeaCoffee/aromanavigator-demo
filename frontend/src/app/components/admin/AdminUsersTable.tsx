import { buttonStyles } from '@/app/components/common/buttonStyles';

// frontend/src/app/components/admin/users/AdminUsersTable.tsx

import Link from 'next/link';

import type { AdminUserListItem, Paginated } from '@/app/types/userTypes';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import { formatShortDateTime } from '@/app/utils/dateFormatUtils';
import {
  buildPageQuery,
  currentPageFromParams,
  type SearchParamsRecord,
} from '@/app/utils/searchParamsUtils';
import {
  getAdminUserRoleLabel,
  getAdminUserStatusLabel,
  getUserDisplayName,
} from '@/app/utils/userDisplayUtils';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';

type Props = {
  users: Paginated<AdminUserListItem>;
  params: SearchParamsRecord;
};

function buildPageHref(params: SearchParamsRecord, page: number) {
  return adminPageUrlBuilder.users.list(buildPageQuery(params, page));
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

export default function AdminUsersTable({ users, params }: Props) {
  const currentPage = currentPageFromParams(params);
  const hasPrevious = Boolean(users.previous) && currentPage > 1;
  const hasNext = Boolean(users.next);
  const hasActiveFilters = hasActiveFilterParams(params, [
    'search',
    'email',
    'is_active',
    'is_staff',
  ]);

  return (
    <section className="grid gap-4 rounded-2xl border p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">РЎРїРёСЃРѕРє РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ</h2>
          <p className="mt-1 text-sm text-gray-500">
            Р—РЅР°Р№РґРµРЅРѕ: {users.count}
          </p>
        </div>

        <div className="flex gap-2">
          {hasPrevious ? (
            <Link
              href={buildPageHref(params, currentPage - 1)}
              className={`${buttonStyles.compactSecondary}`}
            >
              РќР°Р·Р°Рґ
            </Link>
          ) : null}

          {hasNext ? (
            <Link
              href={buildPageHref(params, currentPage + 1)}
              className={`${buttonStyles.compactSecondary}`}
            >
              Р”Р°Р»С–
            </Link>
          ) : null}
        </div>
      </div>

      {users.results.length === 0 ? (
        <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
          {hasActiveFilters
            ? 'РљРѕСЂРёСЃС‚СѓРІР°С‡С–РІ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.'
            : 'РљРѕСЂРёСЃС‚СѓРІР°С‡С–РІ РїРѕРєРё РЅРµРјР°С”.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-3 pr-4 font-medium">ID</th>
                <th className="py-3 pr-4 font-medium">РљРѕСЂРёСЃС‚СѓРІР°С‡</th>
                <th className="py-3 pr-4 font-medium">Email</th>
                <th className="py-3 pr-4 font-medium">Р РѕР»СЊ</th>
                <th className="py-3 pr-4 font-medium">РЎС‚Р°С‚СѓСЃ</th>
                <th className="py-3 pr-4 font-medium">РћСЃС‚Р°РЅРЅС–Р№ РІС…С–Рґ</th>
                <th className="py-3 pr-4 font-medium">Р”С–С—</th>
              </tr>
            </thead>

            <tbody>
              {users.results.map((user) => (
                <tr key={user.id} className="border-b last:border-b-0">
                  <td className="py-3 pr-4">{user.id}</td>

                  <td className="py-3 pr-4">
                    <div className="grid gap-1">
                      <span className="font-medium">
                        {getUserDisplayName(user)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user.profile?.name ?? 'вЂ”'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 pr-4">
                    <div className="grid gap-1">
                      <span>{user.email}</span>
                      <span className="text-xs text-gray-500">
                        {user.email_verified ? 'email verified' : 'email not verified'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 pr-4">{getAdminUserRoleLabel(user)}</td>

                  <td className="py-3 pr-4">
                    <div className="grid gap-1">
                      <span>{getAdminUserStatusLabel(user)}</span>

                      {user.is_suspended ? (
                        <span className="text-xs text-gray-500">
                          {user.suspended_indefinitely
                            ? 'Р‘РµР·СЃС‚СЂРѕРєРѕРІРѕ'
                            : `Р”Рѕ ${formatShortDateTime(user.suspended_until)}`}
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="py-3 pr-4">
                    {formatShortDateTime(user.last_login)}
                  </td>

                  <td className="py-3 pr-4">
                    <Link
                      href={adminPageUrlBuilder.users.detail(user.id)}
                      className={`${buttonStyles.compactSecondary}`}
                    >
                      Р’С–РґРєСЂРёС‚Рё
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
