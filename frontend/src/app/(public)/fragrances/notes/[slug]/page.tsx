import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { publicPageStyles } from '@/app/components/common/publicPage.styles';
import FragranceCard from '@/app/components/fragrances/FragranceCard';
import {
  getFragrancesServer,
  getNoteServer,
} from '@/app/services/fragranceServices.server';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { buildSeoMetadata } from '@/app/utils/seoMetadata';

type FragranceNotePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: FragranceNotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = await getNoteServer(slug).catch(() => null);

  if (!note) {
    return buildSeoMetadata({
      title: 'РќРѕС‚Сѓ РЅРµ Р·РЅР°Р№РґРµРЅРѕ',
      description: 'РЎС‚РѕСЂС–РЅРєСѓ РїР°СЂС„СѓРјРµСЂРЅРѕС— РЅРѕС‚Рё РЅРµ Р·РЅР°Р№РґРµРЅРѕ.',
      path: fragrancePageUrlBuilder.public.noteDetail(slug),
      noIndex: true,
    });
  }

  return buildSeoMetadata({
    title: `${note.name} - Р°СЂРѕРјР°С‚Рё Р· РЅРѕС‚РѕСЋ`,
    description: `РђСЂРѕРјР°С‚Рё Р· РѕС„С–С†С–Р№РЅРѕСЋ РЅРѕС‚РѕСЋ ${note.name}: Р±СЂРµРЅРґРё, РїС–СЂР°РјС–РґРё, СЂРѕРєРё РІРёРїСѓСЃРєСѓ С‚Р° РІС–РґРіСѓРєРё РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ.`,
    path: fragrancePageUrlBuilder.public.noteDetail(note.slug),
    keywords: [note.name, 'РЅРѕС‚Р° Р°СЂРѕРјР°С‚Сѓ', 'Р°СЂРѕРјР°С‚Рё Р·Р° РЅРѕС‚Р°РјРё'],
  });
}

export default async function FragranceNotePage({
  params,
}: FragranceNotePageProps) {
  const { slug } = await params;
  const note = await getNoteServer(slug).catch(() => null);

  if (!note) {
    notFound();
  }

  const fragrances = await getFragrancesServer({
    note: note.id,
    ordering: 'brand',
    page_size: 100,
  });

  return (
    <main className={publicPageStyles.page}>
      <div className={publicPageStyles.container}>
      <header className={publicPageStyles.headerText}>
        <h1 className={publicPageStyles.title}>
          {note.name}
        </h1>
        <p className={publicPageStyles.lead}>
          РђСЂРѕРјР°С‚Рё Р· С†С–С”СЋ РѕС„С–С†С–Р№РЅРѕСЋ РЅРѕС‚РѕСЋ.
        </p>
      </header>

      {fragrances.results.length === 0 ? (
        <section className={publicPageStyles.empty}>
          РђСЂРѕРјР°С‚С–РІ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.
        </section>
      ) : (
        <section className={publicPageStyles.fragranceGrid}>
          {fragrances.results.map((fragrance) => (
            <FragranceCard key={fragrance.id} fragrance={fragrance} />
          ))}
        </section>
      )}
      </div>
    </main>
  );
}
