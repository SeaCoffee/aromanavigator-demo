import { buttonStyles } from '@/app/components/common/buttonStyles';

import Link from 'next/link';
import { notFound } from 'next/navigation';

import AdminUserDetailCard from '@/app/components/admin/AdminUserDetailCard';
import AdminUserRolePanel from '@/app/components/admin/AdminUserRolePanel';
import AdminUserSuspensionForm from '@/app/components/admin/AdminUserSuspensionForm';
import { getUserByLookupServer } from '@/app/services/userServices.server';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';
import { ApiError } from '@/errors/ApiError';

type Props = {
  params: Promise<{
    userId: string;
  }>;
};

function isNotFoundError(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { userId } = await params;

  let user;

  try {
    user = await getUserByLookupServer(userId);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }

    throw error;
  }

  return (
    <main className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">РљРѕСЂРёСЃС‚СѓРІР°С‡ #{user.id}</h1>
          <p className="mt-1 text-sm text-gray-500">
            РџРµСЂРµРіР»СЏРґ РїСЂРѕС„С–Р»СЋ, СЂРѕР»РµР№ С‚Р° РјРѕРґРµСЂР°С†С–Р№РЅРѕРіРѕ СЃС‚Р°С‚СѓСЃСѓ.
          </p>
        </div>

        <Link
          href={adminPageUrlBuilder.users.list()}
          className={`${buttonStyles.secondary}`}
        >
          Р”Рѕ СЃРїРёСЃРєСѓ
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminUserDetailCard user={user} />
        <AdminUserSuspensionForm user={user} />
        <AdminUserRolePanel user={user} />
      </div>
    </main>
  );
}
