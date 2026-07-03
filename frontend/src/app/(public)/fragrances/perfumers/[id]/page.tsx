import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { publicPageStyles } from '@/app/components/common/publicPage.styles';
import FragranceCard from '@/app/components/fragrances/FragranceCard';
import {
  getFragrancesServer,
  getPerfumerServer,
} from '@/app/services/fragranceServices.server';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { buildSeoMetadata } from '@/app/utils/seoMetadata';

type FragrancePerfumerPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: FragrancePerfumerPageProps): Promise<Metadata> {
  const { id } = await params;
  const perfumer = await getPerfumerServer(id).catch(() => null);

  if (!perfumer) {
    return buildSeoMetadata({
      title: 'РџР°СЂС„СѓРјРµСЂР° РЅРµ Р·РЅР°Р№РґРµРЅРѕ',
      description: 'РЎС‚РѕСЂС–РЅРєСѓ РїР°СЂС„СѓРјРµСЂР° РЅРµ Р·РЅР°Р№РґРµРЅРѕ.',
      path: fragrancePageUrlBuilder.public.perfumerDetail(id),
      noIndex: true,
    });
  }

  return buildSeoMetadata({
    title: `${perfumer.name} - РїР°СЂС„СѓРјРµСЂ`,
    description: `РђСЂРѕРјР°С‚Рё РїР°СЂС„СѓРјРµСЂР° ${perfumer.name}: Р±СЂРµРЅРґРё, СЂРѕРєРё РІРёРїСѓСЃРєСѓ, РЅРѕС‚Рё С‚Р° РєР°СЂС‚РєРё Р°СЂРѕРјР°С‚С–РІ.`,
    path: fragrancePageUrlBuilder.public.perfumerDetail(perfumer.id),
    keywords: [perfumer.name, 'РїР°СЂС„СѓРјРµСЂ', 'Р°СЂРѕРјР°С‚Рё РїР°СЂС„СѓРјРµСЂР°'],
  });
}

export default async function FragrancePerfumerPage({
  params,
}: FragrancePerfumerPageProps) {
  const { id } = await params;
  const perfumer = await getPerfumerServer(id).catch(() => null);

  if (!perfumer) {
    notFound();
  }

  const fragrances = await getFragrancesServer({
    perfumer: perfumer.id,
    ordering: 'brand',
    page_size: 100,
  });

  return (
    <main className={publicPageStyles.page}>
      <div className={publicPageStyles.container}>
      <header className={publicPageStyles.headerText}>
        <h1 className={publicPageStyles.title}>
          {perfumer.name}
        </h1>
        <p className={publicPageStyles.lead}>
          РђСЂРѕРјР°С‚Рё С†СЊРѕРіРѕ РїР°СЂС„СѓРјРµСЂР°.
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
