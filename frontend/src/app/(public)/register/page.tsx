import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import AuthCard from '@/app/components/auth/AuthCard';
import GoogleLoginButton from '@/app/components/auth/GoogleLoginButton';
import RegisterForm from '@/app/components/auth/RegisterForm';
import { authStyles as styles } from '@/app/components/auth/auth.styles';
import { getUserServer } from '@/app/lib/session';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { sitePageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import { buildNoIndexMetadata } from '@/app/utils/seoMetadata';

export const metadata: Metadata = buildNoIndexMetadata('Р РµС”СЃС‚СЂР°С†С–СЏ');

const isGoogleAuthEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

function AuthDivider() {
  return (
    <div className={styles.divider}>
      <div className={styles.dividerLine} />
      <span>Р°Р±Рѕ</span>
      <div className={styles.dividerLine} />
    </div>
  );
}

export default async function RegisterPage() {
  const user = await getUserServer();

  if (user) {
    redirect(sitePageUrlBuilder.home());
  }

  return (
    <AuthCard
      title="Р РµС”СЃС‚СЂР°С†С–СЏ"
      description="РЎС‚РІРѕСЂС–С‚СЊ Р°РєР°СѓРЅС‚. РџС–СЃР»СЏ СЂРµС”СЃС‚СЂР°С†С–С— С‡РµСЂРµР· email РїРѕС‚СЂС–Р±РЅРѕ Р°РєС‚РёРІСѓРІР°С‚Рё РїРѕС€С‚Сѓ."
    >
      {isGoogleAuthEnabled ? (
        <>
          <GoogleLoginButton text="signup_with" />
          <AuthDivider />
        </>
      ) : null}

      <RegisterForm />

      <p className={styles.text}>
        Р’Р¶Рµ РјР°С”С‚Рµ Р°РєР°СѓРЅС‚?{' '}
        <Link className={styles.link} href={authPageUrlBuilder.login()}>
          РЈРІС–Р№С‚Рё
        </Link>
      </p>
    </AuthCard>
  );
}
