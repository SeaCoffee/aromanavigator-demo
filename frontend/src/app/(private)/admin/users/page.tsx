// frontend/src/app/(private)/admin/users/page.tsx

import AdminUsersFilters from '@/app/components/admin/AdminUsersFilters';
import AdminUsersTable from '@/app/components/admin/AdminUsersTable';
import { listUsersAdminServer } from '@/app/services/userServices.server';
import type { Query } from '@/app/types/http';
import {
  booleanStringParam,
  cleanParam,
  pageParam,
  type SearchParamsRecord,
} from '@/app/utils/searchParamsUtils';

type Props = {
  searchParams?: Promise<SearchParamsRecord>;
};

function toQuery(params: SearchParamsRecord): Query {
  const query: Query = {};

  const search = cleanParam(params.search);
  const email = cleanParam(params.email);
  const isActive = booleanStringParam(params.is_active);
  const isStaff = booleanStringParam(params.is_staff);
  const ordering = cleanParam(params.ordering);
  const page = pageParam(params.page);

  if (search) query.search = search;
  if (email) query.email = email;
  if (isActive) query.is_active = isActive;
  if (isStaff) query.is_staff = isStaff;
  if (ordering) query.ordering = ordering;
  if (page) query.page = page;

  return query;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = (await searchParams) ?? {};
  const query = toQuery(params);

  const users = await listUsersAdminServer(query);

  return (
    <main className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">РљРѕСЂРёСЃС‚СѓРІР°С‡С–</h1>
        <p className="mt-1 text-sm text-gray-500">
          РџРѕС€СѓРє, С„С–Р»СЊС‚СЂРё С‚Р° РјРѕРґРµСЂР°С†С–СЏ РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ.
        </p>
      </div>

      <AdminUsersFilters params={params} />

      <AdminUsersTable users={users} params={params} />
    </main>
  );
}
