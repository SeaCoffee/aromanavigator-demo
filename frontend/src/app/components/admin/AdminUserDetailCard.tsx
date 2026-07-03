import Link from 'next/link';

import { buttonStyles } from '@/app/components/common/buttonStyles';
import type { AdminUserListItem } from '@/app/types/userTypes';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import { formatDateTime } from '@/app/utils/dateFormatUtils';
import { getUserDisplayName } from '@/app/utils/userDisplayUtils';

type Props = {
  user: AdminUserListItem;
};

function boolLabel(value: boolean) {
  return value ? 'РўР°Рє' : 'РќС–';
}

export default function AdminUserDetailCard({ user }: Props) {
  const displayName = getUserDisplayName(user);

  const publicProfileHref = user.profile?.display_name
    ? userPageUrlBuilder.publicProfile(user.profile.display_name)
    : null;

  return (
    <section className="grid gap-4 rounded-2xl border p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">РћСЃРЅРѕРІРЅР° С–РЅС„РѕСЂРјР°С†С–СЏ</h2>
        <p className="mt-1 text-sm text-gray-500">
          Р”Р°РЅС– РєРѕСЂРёСЃС‚СѓРІР°С‡Р° С‚Р° РїСЂРѕС„С–Р»СЋ.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <dl className="grid gap-2 text-sm">
          <div className="grid gap-1">
            <dt className="text-gray-500">ID</dt>
            <dd>{user.id}</dd>
          </div>

          <div className="grid gap-1">
            <dt className="text-gray-500">Email</dt>
            <dd>{user.email}</dd>
          </div>

          <div className="grid gap-1">
            <dt className="text-gray-500">РђРєС‚РёРІРЅРёР№</dt>
            <dd>{boolLabel(user.is_active)}</dd>
          </div>

          <div className="grid gap-1">
            <dt className="text-gray-500">Staff</dt>
            <dd>{boolLabel(user.is_staff)}</dd>
          </div>

          <div className="grid gap-1">
            <dt className="text-gray-500">Superuser</dt>
            <dd>{boolLabel(user.is_superuser)}</dd>
          </div>
        </dl>

        <dl className="grid gap-2 text-sm">
          <div className="grid gap-1">
            <dt className="text-gray-500">РџСѓР±Р»С–С‡РЅРµ С–РјКјСЏ</dt>
            <dd>{displayName}</dd>
          </div>

          <div className="grid gap-1">
            <dt className="text-gray-500">Р†РјКјСЏ</dt>
            <dd>{user.profile?.name ?? '-'}</dd>
          </div>

          <div className="grid gap-1">
            <dt className="text-gray-500">Р РµРіС–РѕРЅ</dt>
            <dd>{user.profile?.region ?? '-'}</dd>
          </div>

          <div className="grid gap-1">
            <dt className="text-gray-500">РЎС‚РІРѕСЂРµРЅРѕ</dt>
            <dd>{formatDateTime(user.created_at)}</dd>
          </div>

          <div className="grid gap-1">
            <dt className="text-gray-500">РћСЃС‚Р°РЅРЅС–Р№ РІС…С–Рґ</dt>
            <dd>{formatDateTime(user.last_login)}</dd>
          </div>

          <div className="grid gap-1">
            <dt className="text-gray-500">РћСЃС‚Р°РЅРЅС–Р№ logout</dt>
            <dd>{formatDateTime(user.last_logout)}</dd>
          </div>
        </dl>
      </div>

      {user.profile?.about_me ? (
        <div className="grid gap-1 text-sm">
          <h3 className="font-medium">РџСЂРѕ СЃРµР±Рµ</h3>
          <p className="rounded-lg bg-gray-50 p-3 text-gray-700">
            {user.profile.about_me}
          </p>
        </div>
      ) : null}
{publicProfileHref ? (
        <div>
          <Link
            href={publicProfileHref}
            className={`${buttonStyles.secondary}`}
          >
            Р’С–РґРєСЂРёС‚Рё РїСѓР±Р»С–С‡РЅРёР№ РїСЂРѕС„С–Р»СЊ
          </Link>
        </div>
      ) : null}
    </section>
  );
}
