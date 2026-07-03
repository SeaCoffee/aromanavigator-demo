import type { Metadata } from 'next';
import Link from 'next/link';

import ManageWardrobeList from '@/app/components/wardrobe/ManageWardrobeList';
import WardrobeListToolbar from '@/app/components/wardrobe/WardrobeListToolbar';
import WardrobePagination from '@/app/components/wardrobe/WardrobePagination';
import { wardrobeStyles as s } from '@/app/components/wardrobe/wardrobe.styles';
import { requireUserOrRedirect } from '@/app/lib/session';
import { getMyWardrobeServer } from '@/app/services/wardrobeServices.server';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { wardrobePageUrlBuilder } from '@/app/urls/pageUrls/wardrobePageUrlBuilder';
import type { PageSearchParams } from '@/app/utils/wardrobeQuery';
import {
  getWardrobePage,
  toWardrobeListQuery,
} from '@/app/utils/wardrobeQuery';

export const metadata: Metadata = {
  title: 'РњС–Р№ РіР°СЂРґРµСЂРѕР±',
};

type Props = {
  searchParams?: Promise<PageSearchParams>;
};

export default async function MyWardrobePage({ searchParams }: Props) {
  await requireUserOrRedirect();

  const resolvedSearchParams = await searchParams;
  const query = toWardrobeListQuery(resolvedSearchParams ?? {});
  const wardrobe = await getMyWardrobeServer(query);
  const currentPage = getWardrobePage(query);

  return (
    <main className={s.page}>
      <header className={s.header}>
        <div className={s.headerContent}>
          <h1 className={s.title}>РњС–Р№ РіР°СЂРґРµСЂРѕР±</h1>

          <p className={s.subtitle}>

          </p>
        </div>

        <Link href={wardrobePageUrlBuilder.me.create()} className={s.primaryLink}>
          Р”РѕРґР°С‚Рё Р°СЂРѕРјР°С‚
        </Link>
      </header>

      <WardrobeListToolbar
        action={wardrobePageUrlBuilder.me.list()}
        query={query}
      />

      <ManageWardrobeList
        items={wardrobe.results}
        emptyText="РЈ РІР°С€РѕРјСѓ РіР°СЂРґРµСЂРѕР±С– РїРѕРєРё РЅРµРјР°С” Р°СЂРѕРјР°С‚С–РІ."
      />

      <WardrobePagination
        currentPage={currentPage}
        hasNext={Boolean(wardrobe.next)}
        hasPrevious={Boolean(wardrobe.previous)}
        query={query}
        buildHref={wardrobePageUrlBuilder.me.list}
      />
    </main>
  );
}
