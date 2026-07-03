import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { publicPageStyles } from '@/app/components/common/publicPage.styles';
import FragranceCard from '@/app/components/fragrances/FragranceCard';
import {
  getFamilyServer,
  getFragrancesServer,
} from '@/app/services/fragranceServices.server';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { buildSeoMetadata } from '@/app/utils/seoMetadata';

type FragranceFamilyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: FragranceFamilyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const family = await getFamilyServer(slug).catch(() => null);

  if (!family) {
    return buildSeoMetadata({
      title: 'РЎС–РјРµР№СЃС‚РІРѕ РЅРµ Р·РЅР°Р№РґРµРЅРѕ',
      description: 'РЎС‚РѕСЂС–РЅРєСѓ РѕР»СЊС„Р°РєС‚РѕСЂРЅРѕРіРѕ СЃС–РјРµР№СЃС‚РІР° РЅРµ Р·РЅР°Р№РґРµРЅРѕ.',
      path: fragrancePageUrlBuilder.public.familyDetail(slug),
      noIndex: true,
    });
  }

  return buildSeoMetadata({
    title: `${family.name} - РѕР»СЊС„Р°РєС‚РѕСЂРЅРµ СЃС–РјРµР№СЃС‚РІРѕ`,
    description: `РђСЂРѕРјР°С‚Рё РѕР»СЊС„Р°РєС‚РѕСЂРЅРѕРіРѕ СЃС–РјРµР№СЃС‚РІР° ${family.name}: Р±СЂРµРЅРґРё, РЅРѕС‚Рё, СЂРѕРєРё РІРёРїСѓСЃРєСѓ С‚Р° РІС–РґРіСѓРєРё.`,
    path: fragrancePageUrlBuilder.public.familyDetail(family.slug),
    keywords: [family.name, 'РѕР»СЊС„Р°РєС‚РѕСЂРЅРµ СЃС–РјРµР№СЃС‚РІРѕ', 'Р°СЂРѕРјР°С‚Рё Р·Р° СЃС–РјРµР№СЃС‚РІРѕРј'],
  });
}

export default async function FragranceFamilyPage({
  params,
}: FragranceFamilyPageProps) {
  const { slug } = await params;
  const family = await getFamilyServer(slug).catch(() => null);

  if (!family) {
    notFound();
  }

  const fragrances = await getFragrancesServer({
    family: family.id,
    ordering: 'brand',
    page_size: 100,
  });

  return (
    <main className={publicPageStyles.page}>
      <div className={publicPageStyles.container}>
      <header className={publicPageStyles.headerText}>
        <h1 className={publicPageStyles.title}>
          {family.name}
        </h1>
        <p className={publicPageStyles.lead}>
          РђСЂРѕРјР°С‚Рё Р· С†СЊРѕРіРѕ РѕР»СЊС„Р°РєС‚РѕСЂРЅРѕРіРѕ СЃС–РјРµР№СЃС‚РІР°.
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
