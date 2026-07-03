import type { Metadata } from 'next';

import { publicPageStyles } from '@/app/components/common/publicPage.styles';
import FragranceDictionaryIndex from '@/app/components/fragrances/FragranceDictionaryIndex';
import { getPerfumersServer } from '@/app/services/fragranceServices.server';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { buildSeoMetadata } from '@/app/utils/seoMetadata';

export const metadata: Metadata = buildSeoMetadata({
  title: 'РџР°СЂС„СѓРјРµСЂРё',
  description:
    'Р”РѕРІС–РґРЅРёРє РїР°СЂС„СѓРјРµСЂС–РІ С–Р· Р°СЂРѕРјР°С‚Р°РјРё, РЅР°Рґ СЏРєРёРјРё РІРѕРЅРё РїСЂР°С†СЋРІР°Р»Рё.',
  path: fragrancePageUrlBuilder.public.perfumers(),
});

export default async function FragrancePerfumersPage() {
  const perfumers = await getPerfumersServer({
    ordering: 'name',
    page_size: 1000,
  });

  return (
    <main className={publicPageStyles.page}>
      <div className={publicPageStyles.container}>
      <FragranceDictionaryIndex
        title="РџР°СЂС„СѓРјРµСЂРё"
        description="РџРµСЂРµРіР»СЏРґР°Р№С‚Рµ РїР°СЂС„СѓРјРµСЂС–РІ, РїСЂРµРґСЃС‚Р°РІР»РµРЅРёС… Сѓ РґРѕРІС–РґРЅРёРєСѓ."
        items={perfumers.results}
        emptyText="РџР°СЂС„СѓРјРµСЂС–РІ С‰Рµ РЅРµРјР°С”."
        getHref={(perfumer) =>
          fragrancePageUrlBuilder.public.perfumerDetail(perfumer.id)
        }
      />
      </div>
    </main>
  );
}
