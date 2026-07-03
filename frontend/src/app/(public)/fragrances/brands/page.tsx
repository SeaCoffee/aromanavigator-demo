import type { Metadata } from 'next';

import { publicPageStyles } from '@/app/components/common/publicPage.styles';
import FragranceDictionaryIndex from '@/app/components/fragrances/FragranceDictionaryIndex';
import { getBrandsServer } from '@/app/services/fragranceServices.server';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { buildSeoMetadata } from '@/app/utils/seoMetadata';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Р‘СЂРµРЅРґРё Р°СЂРѕРјР°С‚С–РІ',
  description:
    'РђР»С„Р°РІС–С‚РЅРёР№ РґРѕРІС–РґРЅРёРє Р±СЂРµРЅРґС–РІ Р°СЂРѕРјР°С‚С–РІ С–Р· РїРµСЂРµС…РѕРґРѕРј РґРѕ РІСЃС–С… РїР°СЂС„СѓРјС–РІ РєРѕР¶РЅРѕРіРѕ Р±СЂРµРЅРґСѓ.',
  path: fragrancePageUrlBuilder.public.brands(),
});

export default async function FragranceBrandsPage() {
  const brands = await getBrandsServer({
    ordering: 'name',
    page_size: 1000,
  });

  return (
    <main className={publicPageStyles.page}>
      <div className={publicPageStyles.container}>
      <FragranceDictionaryIndex
        title="Р‘СЂРµРЅРґРё"
        description="РџРµСЂРµРіР»СЏРґР°Р№С‚Рµ Р±СЂРµРЅРґРё, РїСЂРµРґСЃС‚Р°РІР»РµРЅС– РІ РґРѕРІС–РґРЅРёРєСѓ Р°СЂРѕРјР°С‚С–РІ."
        items={brands.results}
        emptyText="Р‘СЂРµРЅРґС–РІ С‰Рµ РЅРµРјР°С”."
        getHref={(brand) => fragrancePageUrlBuilder.public.brandDetail(brand.slug)}
      />
      </div>
    </main>
  );
}
