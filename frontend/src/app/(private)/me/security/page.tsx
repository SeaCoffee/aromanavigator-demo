import ChangePasswordForm from '@/app/components/auth/ChangePasswordForm';
import { meSecurityStyles as styles } from '@/app/components/auth/meSecurity.styles';
import { requireUserOrRedirect } from '@/app/lib/session';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';

export default async function MeSecurityPage() {
  const user = await requireUserOrRedirect(
    authPageUrlBuilder.login({
      next: mePageUrlBuilder.profile.security(),
    }),
    mePageUrlBuilder.profile.security(),
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerKicker}>РќР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ Р°РєР°СѓРЅС‚Р°</div>

        <div>
          <h1 className={styles.title}>Р‘РµР·РїРµРєР°</h1>

          <p className={styles.subtitle}>
            РљРµСЂСѓР№С‚Рµ РїР°СЂРѕР»РµРј, СЃРїРѕСЃРѕР±РѕРј РІС…РѕРґСѓ С‚Р° Р±Р°Р·РѕРІРёРјРё РґР°РЅРёРјРё РґРѕСЃС‚СѓРїСѓ РґРѕ
            Р°РєР°СѓРЅС‚Р°.
          </p>
        </div>
      </header>

      <section className={styles.accountCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Р”Р°РЅС– Р°РєР°СѓРЅС‚Р°</h2>

          <p className={styles.cardLead}>
            РћСЃРЅРѕРІРЅР° С–РЅС„РѕСЂРјР°С†С–СЏ, СЏРєР° РІРёРєРѕСЂРёСЃС‚РѕРІСѓС”С‚СЊСЃСЏ РґР»СЏ РІС…РѕРґСѓ С‚Р° РІС–РґРЅРѕРІР»РµРЅРЅСЏ
            РґРѕСЃС‚СѓРїСѓ.
          </p>
        </div>

        <dl className={styles.dataList}>
          <div className={styles.dataRow}>
            <dt className={styles.dataLabel}>Email</dt>
            <dd className={styles.dataValue}>{user.email}</dd>
          </div>

          <div className={styles.dataRow}>
            <dt className={styles.dataLabel}>РџР°СЂРѕР»СЊ</dt>
            <dd>
              <span
                className={
                  user.has_password ? styles.statusGood : styles.statusWarn
                }
              >
                {user.has_password ? 'Р’СЃС‚Р°РЅРѕРІР»РµРЅРѕ' : 'РќРµ РІСЃС‚Р°РЅРѕРІР»РµРЅРѕ'}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <ChangePasswordForm hasPassword={user.has_password} />
    </main>
  );
}
