import Link from 'next/link';

import { requireUserOrRedirect } from '@/app/lib/session';
import { getMyExchangeReceivedServer } from '@/app/services/exchangeServerServices';
import { meExchangePageUrlBuilder } from '@/app/urls/pageUrls/exchangePageUrlBuilder';
import { exchangeStyles } from '@/app/components/exchange/exchangeStyles';
import ExchangeList from '@/app/components/exchange/ExchangeList';
import { getExchangeResults, getExchangeTotal } from '@/app/components/exchange/exchangeHelpers';
import SimplePagination from '@/app/utils/SimplePagination';

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MeExchangeReceivedPage({ searchParams }: Props) {
  await requireUserOrRedirect();

  const sp = await searchParams;
  const data = await getMyExchangeReceivedServer(sp);
  const items = getExchangeResults(data);
  const page = Math.max(1, Number(Array.isArray(sp?.page) ? sp?.page[0] : sp?.page) || 1);

  return (
    <main className={exchangeStyles.page}>
      <div className={exchangeStyles.header}>
        <div>
          <h1 className={exchangeStyles.title}>Р’С…С–РґРЅС– РїСЂРѕРїРѕР·РёС†С–С—</h1>
          <p className={exchangeStyles.subtitle}>
            РџСЂРѕРїРѕР·РёС†С–С— РѕР±РјС–РЅСѓ, СЏРєС– С–РЅС€С– РєРѕСЂРёСЃС‚СѓРІР°С‡С– РЅР°РґС–СЃР»Р°Р»Рё РІР°Рј.
          </p>
        </div>
      </div>

      <nav className={exchangeStyles.tabs}>
        <Link
          href={meExchangePageUrlBuilder.received()}
          className={`${exchangeStyles.tab} ${exchangeStyles.tabActive}`}
        >
          Р’С…С–РґРЅС–
        </Link>

        <Link
          href={meExchangePageUrlBuilder.sent()}
          className={`${exchangeStyles.tab} ${exchangeStyles.tabIdle}`}
        >
          РќР°РґС–СЃР»Р°РЅС–
        </Link>
      </nav>

      <ExchangeList
        items={items}
        variant="received"
        emptyText="РЈ РІР°СЃ РїРѕРєРё РЅРµРјР°С” РІС…С–РґРЅРёС… РїСЂРѕРїРѕР·РёС†С–Р№ РѕР±РјС–РЅСѓ."
      />
      <SimplePagination
        page={page}
        pageSize={20}
        totalItems={getExchangeTotal(data)}
        hrefForPage={(nextPage) => meExchangePageUrlBuilder.received({ ...sp, page: nextPage })}
      />
    </main>
  );
}
