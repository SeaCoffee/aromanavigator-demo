import Link from 'next/link';

import { requireUserOrRedirect } from '@/app/lib/session';
import { meExchangePageUrlBuilder } from '@/app/urls/pageUrls/exchangePageUrlBuilder';
import { exchangeStyles } from '@/app/components/exchange/exchangeStyles';

export default async function MeExchangePage() {
  await requireUserOrRedirect();

  return (
    <main className={exchangeStyles.page}>
      <div className={exchangeStyles.header}>
        <div>
          <h1 className={exchangeStyles.title}>РћР±РјС–РЅРё</h1>
          <p className={exchangeStyles.subtitle}>
            РўСѓС‚ Р·С–Р±СЂР°РЅС– РІР°С€С– РІС…С–РґРЅС– С‚Р° РЅР°РґС–СЃР»Р°РЅС– РїСЂРѕРїРѕР·РёС†С–С— РѕР±РјС–РЅСѓ.
          </p>
        </div>
      </div>

      <nav className={exchangeStyles.tabs}>
        <Link
          href={meExchangePageUrlBuilder.received()}
          className={`${exchangeStyles.tab} ${exchangeStyles.tabIdle}`}
        >
          Р’С…С–РґРЅС– РїСЂРѕРїРѕР·РёС†С–С—
        </Link>

        <Link
          href={meExchangePageUrlBuilder.sent()}
          className={`${exchangeStyles.tab} ${exchangeStyles.tabIdle}`}
        >
          РќР°РґС–СЃР»Р°РЅС– РїСЂРѕРїРѕР·РёС†С–С—
        </Link>
      </nav>
    </main>
  );
}
