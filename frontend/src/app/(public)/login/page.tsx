import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import AuthCard from '@/app/components/auth/AuthCard';
import GoogleLoginButton from '@/app/components/auth/GoogleLoginButton';
import LoginForm from '@/app/components/auth/LoginForm';
import { authStyles as styles } from '@/app/components/auth/auth.styles';
import { getUserServer } from '@/app/lib/session';
import { readServerRefreshToken } from '@/app/services/serverAuthTokens';
import { authNextApiUrlBuilder } from '@/app/urls/authNextApiUrlBuilder';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';
import { buildNoIndexMetadata } from '@/app/utils/seoMetadata';
import { safeNextPath } from '@/app/utils/safeNextPath';

type Props = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export const metadata: Metadata = buildNoIndexMetadata('Р’С…С–Рґ');

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

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next = safeNextPath(params?.next, mePageUrlBuilder.home());

  const user = await getUserServer();

  if (user) {
    redirect(next);
  }

  const refresh = await readServerRefreshToken();

  if (refresh) {
    redirect(authNextApiUrlBuilder.refresh({ next }));
  }

  return (
    <AuthCard
      title="Р’С…С–Рґ"
      description="РЈРІС–Р№РґС–С‚СЊ РІ Р°РєР°СѓРЅС‚, С‰РѕР± РєРµСЂСѓРІР°С‚Рё РїСЂРѕС„С–Р»РµРј, РіР°СЂРґРµСЂРѕР±РѕРј С‚Р° РѕР±РјС–РЅР°РјРё."
    >
      {isGoogleAuthEnabled ? (
        <>
          <GoogleLoginButton next={next} text="signin_with" />
          <AuthDivider />
        </>
      ) : null}

      <LoginForm next={next} />

      <p className={styles.text}>
        РќРµРјР°С” Р°РєР°СѓРЅС‚Р°?{' '}
        <Link className={styles.link} href={authPageUrlBuilder.register()}>
          Р—Р°СЂРµС”СЃС‚СЂСѓРІР°С‚РёСЃСЏ
        </Link>
      </p>

      <p className={styles.text}>
        Р—Р°Р±СѓР»Рё РїР°СЂРѕР»СЊ?{' '}
        <Link
          className={styles.link}
          href={authPageUrlBuilder.recovery.request()}
        >
          Р’С–РґРЅРѕРІРёС‚Рё РїР°СЂРѕР»СЊ
        </Link>
      </p>
    </AuthCard>
  );
}
