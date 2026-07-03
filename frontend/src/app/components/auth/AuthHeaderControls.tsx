import { buttonStyles } from '@/app/components/common/buttonStyles';

import Link from 'next/link';

import LogoutButton from '@/app/components/auth/LogoutButton';
import { getUserServer } from '@/app/lib/session';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';

function getUserLabel(user: Awaited<ReturnType<typeof getUserServer>>) {
  if (!user) return '';

  return user.profile?.display_name || user.profile?.name || 'РћСЃРѕР±РёСЃС‚РёР№ РєР°Р±С–РЅРµС‚';
}

export default async function AuthHeaderControls() {
  const user = await getUserServer();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={authPageUrlBuilder.login()}
          className={`${buttonStyles.compactSecondary}`}
        >
          РЈРІС–Р№С‚Рё
        </Link>

        <Link
          href={authPageUrlBuilder.register()}
          className={`${buttonStyles.compactPrimary}`}
        >
          Р РµС”СЃС‚СЂР°С†С–СЏ
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href={mePageUrlBuilder.home()}
        className="text-sm font-medium underline-offset-4 hover:underline"
      >
        {getUserLabel(user)}
      </Link>

      <LogoutButton />
    </div>
  );
}
