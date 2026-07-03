import Link from 'next/link';

import { requireUserOrRedirect } from '@/app/lib/session';
import { getMyExchangeSentServer } from '@/app/services/exchangeServerServices';
import { meExchangePageUrlBuilder } from '@/app/urls/pageUrls/exchangePageUrlBuilder';
import { exchangeStyles } from '@/app/components/exchange/exchangeStyles';
import ExchangeList from '@/app/components/exchange/ExchangeList';
import { getExchangeResults, getExchangeTotal } from '@/app/components/exchange/exchangeHelpers';
import SimplePagination from '@/app/utils/SimplePagination';

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MeExchangeSentPage({ searchParams }: Props) {
  await requireUserOrRedirect();

  const sp = await searchParams;
  const data = await getMyExchangeSentServer(sp);
  const items = getExchangeResults(data);
  const page = Math.max(1, Number(Array.isArray(sp?.page) ? sp?.page[0] : sp?.page) || 1);

  return (
    <main className={exchangeStyles.page}>
      <div className={exchangeStyles.header}>
        <div>
          <h1 className={exchangeStyles.title}>РќР°РґС–СЃР»Р°РЅС– РїСЂРѕРїРѕР·РёС†С–С—</h1>
          <p className={exchangeStyles.subtitle}>
            РџСЂРѕРїРѕР·РёС†С–С— РѕР±РјС–РЅСѓ, СЏРєС– РІРё РЅР°РґС–СЃР»Р°Р»Рё С–РЅС€РёРј РєРѕСЂРёСЃС‚СѓРІР°С‡Р°Рј.
          </p>
        </div>
      </div>

      <nav className={exchangeStyles.tabs}>
        <Link
          href={meExchangePageUrlBuilder.received()}
          className={`${exchangeStyles.tab} ${exchangeStyles.tabIdle}`}
        >
          Р’С…С–РґРЅС–
        </Link>

        <Link
          href={meExchangePageUrlBuilder.sent()}
          className={`${exchangeStyles.tab} ${exchangeStyles.tabActive}`}
        >
          РќР°РґС–СЃР»Р°РЅС–
        </Link>
      </nav>

      <ExchangeList
        items={items}
        variant="sent"
        emptyText="Р’Рё РїРѕРєРё РЅРµ РЅР°РґСЃРёР»Р°Р»Рё РїСЂРѕРїРѕР·РёС†С–С— РѕР±РјС–РЅСѓ."
      />
      <SimplePagination
        page={page}
        pageSize={20}
        totalItems={getExchangeTotal(data)}
        hrefForPage={(nextPage) => meExchangePageUrlBuilder.sent({ ...sp, page: nextPage })}
      />
    </main>
  );
}
