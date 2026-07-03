import type { Metadata } from 'next';
import Link from 'next/link';

import { activateAccountAction } from '@/app/actions/authActions';
import { authStyles as styles } from '@/app/components/auth/auth.styles';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { formatActionMessage } from '@/app/utils/messageUtils';
import { buildNoIndexMetadata } from '@/app/utils/seoMetadata';

export const metadata: Metadata = buildNoIndexMetadata('РђРєС‚РёРІР°С†С–СЏ Р°РєР°СѓРЅС‚Р°');

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ActivateAccountPage({ params }: Props) {
  const { token } = await params;
  const result = await activateAccountAction(token);

  return (
    <main className={styles.page}>
      <div className={styles.cardPage}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {result.ok ? 'РђРєР°СѓРЅС‚ Р°РєС‚РёРІРѕРІР°РЅРѕ' : 'РџРѕРјРёР»РєР° Р°РєС‚РёРІР°С†С–С—'}
          </h1>
        </div>

        <div className={styles.statusCard}>
          <div className={result.ok ? styles.messageSuccess : styles.messageError}>
            {formatActionMessage(result.msg, '')}
          </div>

          <Link className={styles.submit} href={authPageUrlBuilder.login()}>
            РџРµСЂРµР№С‚Рё РґРѕ РІС…РѕРґСѓ
          </Link>
        </div>
      </div>
    </main>
  );
}
