import type { ReactNode } from 'react';

import MeMenu from '@/app/components/me/MeMenu';
import { requireUserOrRedirect } from '@/app/lib/session';

type Props = {
  children: ReactNode;
};

export default async function MeLayout({ children }: Props) {
  await requireUserOrRedirect();

  return (
    <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[230px_minmax(0,1fr)] lg:px-6">
      <MeMenu />

      <section className="min-w-0">{children}</section>
    </div>
  );
}
