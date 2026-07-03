import type { Metadata } from 'next';

import AuthCard from '@/app/components/auth/AuthCard';
import RecoveryResetForm from '@/app/components/auth/RecoveryResetForm';
import { authStyles as styles } from '@/app/components/auth/auth.styles';
import { recoveryTokenCheckServer } from '@/app/services/authServerServices';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { buildNoIndexMetadata } from '@/app/utils/seoMetadata';

export const metadata: Metadata = buildNoIndexMetadata('Р—РјС–РЅР° РїР°СЂРѕР»СЏ');

type Props = {
  params: Promise<{
    token: string;
  }>;
};

export default async function RecoveryResetPage({ params }: Props) {
  const { token } = await params;

  let tokenIsValid = true;
  let errorMessage = '';

  try {
    await recoveryTokenCheckServer(token);
  } catch (error) {
    tokenIsValid = false;
    errorMessage =
      error instanceof Error
        ? error.message
        : 'РџРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ РІС–РґРЅРѕРІР»РµРЅРЅСЏ РЅРµРґС–Р№СЃРЅРµ Р°Р±Рѕ Р·Р°СЃС‚Р°СЂС–Р»Рµ.';
  }

  return (
    <AuthCard
      title="РќРѕРІРёР№ РїР°СЂРѕР»СЊ"
      description="Р’СЃС‚Р°РЅРѕРІС–С‚СЊ РЅРѕРІРёР№ РїР°СЂРѕР»СЊ РґР»СЏ Р°РєР°СѓРЅС‚Р°."
    >
      {tokenIsValid ? (
        <RecoveryResetForm token={token} />
      ) : (
        <div className={styles.statusCard}>
          <div className={styles.messageError}>{errorMessage}</div>

          <a
            className={styles.submit}
            href={authPageUrlBuilder.recovery.request()}
          >
            Р—Р°РїСЂРѕСЃРёС‚Рё РЅРѕРІРµ РїРѕСЃРёР»Р°РЅРЅСЏ
          </a>
        </div>
      )}
    </AuthCard>
  );
}
