import type { Metadata } from 'next';

import { publicPageStyles } from '@/app/components/common/publicPage.styles';
import FragranceDictionaryIndex from '@/app/components/fragrances/FragranceDictionaryIndex';
import { getFamiliesServer } from '@/app/services/fragranceServices.server';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { buildSeoMetadata } from '@/app/utils/seoMetadata';

export const metadata: Metadata = buildSeoMetadata({
  title: 'РћР»СЊС„Р°РєС‚РѕСЂРЅС– СЃС–РјРµР№СЃС‚РІР°',
  description:
    'Р”РѕРІС–РґРЅРёРє РѕР»СЊС„Р°РєС‚РѕСЂРЅРёС… СЃС–РјРµР№СЃС‚РІ Р°СЂРѕРјР°С‚С–РІ: РєРІС–С‚РєРѕРІС–, СЃС…С–РґРЅС–, РґРµСЂРµРІРЅС–, С†РёС‚СЂСѓСЃРѕРІС– С‚Р° С–РЅС€С– РїСЂРѕС„С–Р»С–.',
  path: fragrancePageUrlBuilder.public.families(),
});

export default async function FragranceFamiliesPage() {
  const families = await getFamiliesServer({
    ordering: 'name',
    page_size: 1000,
  });

  return (
    <main className={publicPageStyles.page}>
      <div className={publicPageStyles.container}>
      <FragranceDictionaryIndex
        title="РћР»СЊС„Р°РєС‚РѕСЂРЅС– СЃС–РјРµР№СЃС‚РІР°"
        description="РџРµСЂРµРіР»СЏРґР°Р№С‚Рµ РѕР»СЊС„Р°РєС‚РѕСЂРЅС– СЃС–РјРµР№СЃС‚РІР° Р· РґРѕРІС–РґРЅРёРєР° Р°СЂРѕРјР°С‚С–РІ."
        items={families.results}
        emptyText="РЎС–РјРµР№СЃС‚РІ С‰Рµ РЅРµРјР°С”."
        getHref={(family) =>
          fragrancePageUrlBuilder.public.familyDetail(family.slug)
        }
      />
      </div>
    </main>
  );
}
