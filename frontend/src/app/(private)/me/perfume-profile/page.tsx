import type { Metadata } from 'next';
import Link from 'next/link';

import TasteProfileEditor from '@/app/components/taste-profile/TasteProfileEditor';
import TasteProfileSummary from '@/app/components/taste-profile/TasteProfileSummary';
import { tasteProfileStyles as s } from '@/app/components/taste-profile/tasteProfile.styles';
import {
  getBrandsServer,
  getFamiliesServer,
  getFragrancesServer,
  getNotesServer,
  getPerfumersServer,
} from '@/app/services/fragranceServices.server';
import { getMyTasteProfileServer } from '@/app/services/tasteProfileServices.server';
import type { TasteProfileFormOptions } from '@/app/types/tasteProfileTypes';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import { requireUserOrRedirect } from '@/app/lib/session';

export const metadata: Metadata = {
  title: 'РџР°СЂС„СѓРјРµСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ',
  description:
    'РћСЃРѕР±РёСЃС‚РёР№ СЃРјР°РєРѕРІРёР№ РїСЂРѕС„С–Р»СЊ: СѓР»СЋР±Р»РµРЅС– РЅРѕС‚Рё, СЃС–РјРµР№СЃС‚РІР°, Р±СЂРµРЅРґРё, РїР°СЂС„СѓРјРµСЂРё С‚Р° Р°СЂРѕРјР°С‚Рё.',
};

async function getTasteOptions(): Promise<TasteProfileFormOptions> {
  const [brands, notes, families, perfumers, fragrances] = await Promise.all([
    getBrandsServer({ page_size: 1000, ordering: 'name' }),
    getNotesServer({ page_size: 1000, ordering: 'name' }),
    getFamiliesServer({ page_size: 1000, ordering: 'name' }),
    getPerfumersServer({ page_size: 1000, ordering: 'name' }),
    getFragrancesServer({ page_size: 1000, ordering: 'brand' }),
  ]);

  return {
    brands: brands.results,
    notes: notes.results,
    families: families.results,
    perfumers: perfumers.results,
    fragrances: fragrances.results.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      release_year: item.release_year,
      brand: {
        id: item.brand.id,
        name: item.brand.name,
        slug: item.brand.slug,
      },
      display_name: `${item.brand.name} вЂ” ${item.name}`,
    })),
  };
}

export default async function MyPerfumeProfilePage() {
  const user = await requireUserOrRedirect();
  const publicName = user.profile?.display_name || String(user.id);

  const [profile, options] = await Promise.all([
    getMyTasteProfileServer(),
    getTasteOptions(),
  ]);

  return (
    <main className={s.page}>
      <header className={s.header}>
        <h1 className={s.title}>РџР°СЂС„СѓРјРµСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ</h1>

        <p className={s.subtitle}>
          РЎРјР°РєРѕРІРёР№ РїСЂРѕС„С–Р»СЊ: С‰Рѕ РІР°Рј РїРѕРґРѕР±Р°С”С‚СЊСЃСЏ, С‡РѕРіРѕ РєСЂР°С‰Рµ РЅРµ РїСЂРѕРїРѕРЅСѓРІР°С‚Рё, СЏРєС–
          РЅРѕС‚Рё, СЃС–РјРµР№СЃС‚РІР°, Р±СЂРµРЅРґРё, РїР°СЂС„СѓРјРµСЂРё Р№ РѕРєСЂРµРјС– Р°СЂРѕРјР°С‚Рё РІР°Р¶Р»РёРІС– РґР»СЏ РІР°СЃ.
        </p>

        <nav className={s.tabs}>
          <Link className={s.tabLink} href={mePageUrlBuilder.wardrobe.list()}>
            Р“Р°СЂРґРµСЂРѕР±
          </Link>

          <Link className={s.tabLink} href={mePageUrlBuilder.wardrobe.create()}>
            Р”РѕРґР°С‚Рё Р°СЂРѕРјР°С‚ Сѓ РіР°СЂРґРµСЂРѕР±
          </Link>

          <Link
            className={s.tabLink}
            href={userPageUrlBuilder.tasteProfile(publicName)}
          >
            РџСѓР±Р»С–С‡РЅР° СЃС‚РѕСЂС–РЅРєР°
          </Link>
        </nav>
      </header>

      <section className={s.sections}>
        <TasteProfileSummary profile={profile} editable />
        <TasteProfileEditor profile={profile} options={options} />
      </section>
    </main>
  );
}
