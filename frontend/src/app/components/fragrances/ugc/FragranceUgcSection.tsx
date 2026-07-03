import NoteSuggestionsBlock from '@/app/components/fragrances/ugc/NoteSuggestionsBlock';
import SimilaritySuggestionsBlock from '@/app/components/fragrances/ugc/SimilaritySuggestionsBlock';
import {
  getFragrancesServer,
  getNotesServer,
} from '@/app/services/fragranceServices.server';
import {
  getNoteSuggestionsByFragranceServer,
  getSimilaritySuggestionsByFragranceServer,
} from '@/app/services/fragranceUgcService.server';

import type { FragranceDetail } from '@/app/types/fragranceTypes';
import Link from 'next/link';
import { buttonStyles } from '@/app/components/common/buttonStyles';

type FragranceUgcSectionProps = {
  fragrance: FragranceDetail;
  isAuthenticated: boolean;
  loginHref: string;
};

export default async function FragranceUgcSection({
  fragrance,
  isAuthenticated,
  loginHref,
}: FragranceUgcSectionProps) {
  const [noteSuggestions, similaritySuggestions, notes, fragrances] =
    await Promise.all([
      getNoteSuggestionsByFragranceServer(fragrance.id, {
        ordering: '-score',
        page_size: 100,
      }).catch(() => ({ results: [] })),
      getSimilaritySuggestionsByFragranceServer(fragrance.id, {
        ordering: '-score',
        page_size: 50,
      }).catch(() => ({ results: [] })),
      isAuthenticated ? getNotesServer({ ordering: 'name', page_size: 1000 }).catch(() => ({
        results: [],
      })) : Promise.resolve({ results: [] }),
      isAuthenticated ? getFragrancesServer({ ordering: 'name', page_size: 1000 }).catch(() => ({
        results: [],
      })) : Promise.resolve({ results: [] }),
    ]);

  return (
    <section className="grid gap-8">
      <header className="grid gap-2">
        <h2 className="text-2xl font-semibold text-neutral-950">РЎРїС–Р»СЊРЅРѕС‚Р°</h2>
        <p className="max-w-3xl text-sm text-neutral-600">
          РљРѕСЂРёСЃС‚СѓРІР°С‡С– РјРѕР¶СѓС‚СЊ Р·Р°РїСЂРѕРїРѕРЅСѓРІР°С‚Рё РЅРѕС‚Рё С‚Р° СЃС…РѕР¶С– Р°СЂРѕРјР°С‚Рё. РџС–СЃР»СЏ
          РјРѕРґРµСЂР°С†С–С— СЃС…РІР°Р»РµРЅС– РЅРѕС‚Рё РґРѕРґР°СЋС‚СЊСЃСЏ РґРѕ РѕС„С–С†С–Р№РЅРѕС— РїС–СЂР°РјС–РґРё Р°СЂРѕРјР°С‚Сѓ.
          РџСЂРѕРїРѕР·РёС†С–С— СЃС…РѕР¶РёС… Р°СЂРѕРјР°С‚С–РІ Р·Р°Р»РёС€Р°СЋС‚СЊСЃСЏ РѕРєСЂРµРјРёРј Р±Р»РѕРєРѕРј СЃРїС–Р»СЊРЅРѕС‚Рё.
        </p>
      </header>

      {!isAuthenticated ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[#eadfd5] bg-white p-4">
          <p className="text-sm text-neutral-600">
            РЈРІС–Р№РґС–С‚СЊ, С‰РѕР± Р·Р°РїСЂРѕРїРѕРЅСѓРІР°С‚Рё РЅРѕС‚Сѓ, СЃС…РѕР¶РёР№ Р°СЂРѕРјР°С‚ Р°Р±Рѕ РїСЂРѕРіРѕР»РѕСЃСѓРІР°С‚Рё.
          </p>
          <Link href={loginHref} className={buttonStyles.compactSecondary}>
            РЈРІС–Р№С‚Рё
          </Link>
        </div>
      ) : null}

      <NoteSuggestionsBlock
        fragranceId={fragrance.id}
        fragranceSlug={fragrance.slug}
        initialSuggestions={noteSuggestions.results}
        notes={notes.results}
        canInteract={isAuthenticated}
      />

      <SimilaritySuggestionsBlock
        fragranceId={fragrance.id}
        fragranceSlug={fragrance.slug}
        initialSuggestions={similaritySuggestions.results}
        fragrances={fragrances.results}
        canInteract={isAuthenticated}
      />
    </section>
  );
}
