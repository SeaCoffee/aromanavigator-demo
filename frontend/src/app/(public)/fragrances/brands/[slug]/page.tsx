import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { publicPageStyles } from '@/app/components/common/publicPage.styles';
import FragranceCard from '@/app/components/fragrances/FragranceCard';
import {
  getBrandServer,
  getFragrancesServer,
} from '@/app/services/fragranceServices.server';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { buildSeoMetadata } from '@/app/utils/seoMetadata';

type FragranceBrandPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: FragranceBrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandServer(slug).catch(() => null);

  if (!brand) {
    return buildSeoMetadata({
      title: 'Р‘СЂРµРЅРґ РЅРµ Р·РЅР°Р№РґРµРЅРѕ',
      description: 'РЎС‚РѕСЂС–РЅРєСѓ Р±СЂРµРЅРґСѓ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.',
      path: fragrancePageUrlBuilder.public.brandDetail(slug),
      noIndex: true,
    });
  }

  return buildSeoMetadata({
    title: `${brand.name} - Р°СЂРѕРјР°С‚Рё Р±СЂРµРЅРґСѓ`,
    description: `${brand.name}: Р°СЂРѕРјР°С‚Рё Р±СЂРµРЅРґСѓ${brand.country ? `, РєСЂР°С—РЅР° ${brand.country}` : ''}, РЅРѕС‚Рё, СЂРѕРєРё РІРёРїСѓСЃРєСѓ С‚Р° РєР°СЂС‚РєРё Р°СЂРѕРјР°С‚С–РІ.`,
    path: fragrancePageUrlBuilder.public.brandDetail(brand.slug),
    keywords: [brand.name, 'Р±СЂРµРЅРґ Р°СЂРѕРјР°С‚С–РІ', 'РїР°СЂС„СѓРјРё Р±СЂРµРЅРґСѓ'],
  });
}

export default async function FragranceBrandPage({
  params,
}: FragranceBrandPageProps) {
  const { slug } = await params;
  const brand = await getBrandServer(slug).catch(() => null);

  if (!brand) {
    notFound();
  }

  const fragrances = await getFragrancesServer({
    brand: brand.id,
    ordering: 'name',
    page_size: 100,
  });

  return (
    <main className={publicPageStyles.page}>
      <div className={publicPageStyles.container}>
      <header className={publicPageStyles.headerText}>
        <h1 className={publicPageStyles.title}>
          {brand.name}
        </h1>
        <p className={publicPageStyles.lead}>
          {brand.country || 'РљСЂР°С—РЅСѓ Р±СЂРµРЅРґСѓ РЅРµ РІРєР°Р·Р°РЅРѕ.'}
        </p>
      </header>

      {fragrances.results.length === 0 ? (
        <section className={publicPageStyles.empty}>
          Р”Р»СЏ С†СЊРѕРіРѕ Р±СЂРµРЅРґСѓ С‰Рµ РЅРµРјР°С” Р°СЂРѕРјР°С‚С–РІ.
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
