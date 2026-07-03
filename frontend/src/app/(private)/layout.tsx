// frontend/src/app/(private)/layout.tsx

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import PresenceHeartbeat from '@/app/components/users/PresenceHeartbeat';
import { requireUserOrRedirect } from '@/app/lib/session';
import { buildNoIndexMetadata } from '@/app/utils/seoMetadata';

type Props = {
  children: ReactNode;
};

export const metadata: Metadata = buildNoIndexMetadata('РћСЃРѕР±РёСЃС‚РёР№ РєР°Р±С–РЅРµС‚');

export const dynamic = 'force-dynamic';

export default async function PrivateLayout({ children }: Props) {
  await requireUserOrRedirect();

  return (
    <>
      <PresenceHeartbeat />
      {children}
    </>
  );
}
