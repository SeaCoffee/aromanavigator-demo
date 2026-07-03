import { buttonStyles } from '@/app/components/common/buttonStyles';

// frontend/src/app/components/admin/users/AdminUsersFilters.tsx

import Link from 'next/link';

import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';
import {
  cleanParam,
  type SearchParamsRecord,
} from '@/app/utils/searchParamsUtils';

type Props = {
  params: SearchParamsRecord;
};

export default function AdminUsersFilters({ params }: Props) {
  const search = cleanParam(params.search) ?? '';
  const email = cleanParam(params.email) ?? '';
  const isActive = cleanParam(params.is_active) ?? '';
  const isStaff = cleanParam(params.is_staff) ?? '';
  const ordering = cleanParam(params.ordering) ?? '-created_at';

  return (
    <form
      action={adminPageUrlBuilder.users.list()}
      method="get"
      className="grid gap-4 rounded-2xl border p-4 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-1">
          <label htmlFor="admin-users-search" className="text-sm font-medium">
            РџРѕС€СѓРє
          </label>
          <input
            id="admin-users-search"
            name="search"
            defaultValue={search}
            placeholder="Email, display name Р°Р±Рѕ С–РјКјСЏ"
            className="rounded-lg border px-3 py-2"
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="admin-users-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="admin-users-email"
            name="email"
            defaultValue={email}
            placeholder="Р¤С–Р»СЊС‚СЂ РїРѕ email"
            className="rounded-lg border px-3 py-2"
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="admin-users-active" className="text-sm font-medium">
            РђРєС‚РёРІРЅС–СЃС‚СЊ
          </label>
          <select
            id="admin-users-active"
            name="is_active"
            defaultValue={isActive}
            className="rounded-lg border px-3 py-2"
          >
            <option value="">РЈСЃС–</option>
            <option value="true">РђРєС‚РёРІРЅС–</option>
            <option value="false">РќРµР°РєС‚РёРІРЅС–</option>
          </select>
        </div>

        <div className="grid gap-1">
          <label htmlFor="admin-users-staff" className="text-sm font-medium">
            Staff
          </label>
          <select
            id="admin-users-staff"
            name="is_staff"
            defaultValue={isStaff}
            className="rounded-lg border px-3 py-2"
          >
            <option value="">РЈСЃС–</option>
            <option value="true">Staff</option>
            <option value="false">РќРµ staff</option>
          </select>
        </div>

        <div className="grid gap-1 md:col-span-2">
          <label htmlFor="admin-users-ordering" className="text-sm font-medium">
            РЎРѕСЂС‚СѓРІР°РЅРЅСЏ
          </label>
          <select
            id="admin-users-ordering"
            name="ordering"
            defaultValue={ordering}
            className="rounded-lg border px-3 py-2"
          >
            <option value="-created_at">РќРѕРІС– СЃРїРѕС‡Р°С‚РєСѓ</option>
            <option value="created_at">РЎС‚Р°СЂС– СЃРїРѕС‡Р°С‚РєСѓ</option>
            <option value="email">Email A-Z</option>
            <option value="-email">Email Z-A</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className={`${buttonStyles.primary}`}
        >
          Р—Р°СЃС‚РѕСЃСѓРІР°С‚Рё
        </button>

        <Link
          href={adminPageUrlBuilder.users.list()}
          className={`${buttonStyles.secondary}`}
        >
          РЎРєРёРЅСѓС‚Рё
        </Link>
      </div>
    </form>
  );
}
