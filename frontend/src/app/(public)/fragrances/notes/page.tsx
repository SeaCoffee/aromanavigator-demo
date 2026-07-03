import type { Metadata } from 'next';

import { publicPageStyles } from '@/app/components/common/publicPage.styles';
import FragranceDictionaryIndex from '@/app/components/fragrances/FragranceDictionaryIndex';
import { getNotesServer } from '@/app/services/fragranceServices.server';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { buildSeoMetadata } from '@/app/utils/seoMetadata';

export const metadata: Metadata = buildSeoMetadata({
  title: 'РќРѕС‚Рё Р°СЂРѕРјР°С‚С–РІ',
  description:
    'Р”РѕРІС–РґРЅРёРє РїР°СЂС„СѓРјРµСЂРЅРёС… РЅРѕС‚ С–Р· Р°СЂРѕРјР°С‚Р°РјРё, Сѓ СЏРєРёС… РІРѕРЅРё РїСЂРёСЃСѓС‚РЅС– РІ РѕС„С–С†С–Р№РЅС–Р№ РїС–СЂР°РјС–РґС–.',
  path: fragrancePageUrlBuilder.public.notes(),
});

export default async function FragranceNotesPage() {
  const notes = await getNotesServer({
    ordering: 'name',
    page_size: 1000,
  });

  return (
    <main className={publicPageStyles.page}>
      <div className={publicPageStyles.container}>
      <FragranceDictionaryIndex
        title="РќРѕС‚Рё"
        description="РџРµСЂРµРіР»СЏРґР°Р№С‚Рµ РЅРѕС‚Рё, С‰Рѕ РІРёРєРѕСЂРёСЃС‚РѕРІСѓСЋС‚СЊСЃСЏ РІ РґРѕРІС–РґРЅРёРєСѓ Р°СЂРѕРјР°С‚С–РІ."
        items={notes.results}
        emptyText="РќРѕС‚ С‰Рµ РЅРµРјР°С”."
        getHref={(note) => fragrancePageUrlBuilder.public.noteDetail(note.slug)}
      />
      </div>
    </main>
  );
}
