//frontend\src\app\components\auth\LogoutButton.tsx
'use client';

import { useTransition } from 'react';
import { logoutAction } from '@/app/actions/authActions';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';


type Props = {
  redirectTo?: string;
  className?: string;
};


export default function LogoutButton({
  redirectTo = authPageUrlBuilder.login(),
  className,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      void logoutAction(redirectTo);
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleLogout}
      className={
        className ??
        'rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-60'
      }
    >
      {isPending ? 'Р’РёС…С–Рґ...' : 'Р’РёР№С‚Рё'}
    </button>
  );
}
