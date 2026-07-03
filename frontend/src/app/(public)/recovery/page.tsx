import type { Metadata } from 'next';

import AuthCard from '@/app/components/auth/AuthCard';
import RecoveryRequestForm from '@/app/components/auth/RecoveryRequestForm';
import { authStyles as styles } from '@/app/components/auth/auth.styles';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { buildNoIndexMetadata } from '@/app/utils/seoMetadata';

export const metadata: Metadata = buildNoIndexMetadata('Р’С–РґРЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ');

export default function RecoveryPage() {
  return (
    <AuthCard
      title="Р’С–РґРЅРѕРІР»РµРЅРЅСЏ РїР°СЂРѕР»СЏ"
      description="Р’РІРµРґС–С‚СЊ email, С– СЏРєС‰Рѕ Р°РєР°СѓРЅС‚ С–СЃРЅСѓС”, РјРё РЅР°РґС–С€Р»РµРјРѕ РїРѕСЃРёР»Р°РЅРЅСЏ РґР»СЏ Р·РјС–РЅРё РїР°СЂРѕР»СЏ."
    >
      <RecoveryRequestForm />

      <p className={styles.text}>
        Р—РіР°РґР°Р»Рё РїР°СЂРѕР»СЊ?{' '}
        <a className={styles.link} href={authPageUrlBuilder.login()}>
          РЈРІС–Р№С‚Рё
        </a>
      </p>
    </AuthCard>
  );
}
