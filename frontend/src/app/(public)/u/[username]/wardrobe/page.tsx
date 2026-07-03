import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import WardrobeList from '@/app/components/wardrobe/WardrobeList';
import WardrobeListToolbar from '@/app/components/wardrobe/WardrobeListToolbar';
import WardrobePagination from '@/app/components/wardrobe/WardrobePagination';
import { getPublicUserByUsernameServer } from '@/app/services/userServices.server';
import { getPublicWardrobeServer } from '@/app/services/wardrobeServices.server';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { exchangePageUrlBuilder } from '@/app/urls/pageUrls/exchangePageUrlBuilder';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import type { PageSearchParams } from '@/app/utils/wardrobeQuery';
import {
  getWardrobePage,
  toWardrobeListQuery,
} from '@/app/utils/wardrobeQuery';
import { getPublicUserDisplayName } from '@/app/utils/userDisplayUtils';
import { ApiError } from '@/errors/ApiError';

type Props = {
  params: Promise<{
    username: string;
  }>;
  searchParams?: Promise<PageSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `Р“Р°СЂРґРµСЂРѕР± ${username}`,
  };
}

function isNotFoundError(error: unknown) {
  return error instanceof ApiError && error.status === 404;
}

export default async function PublicUserWardrobePage({
  params,
  searchParams,
}: Props) {
  const { username } = await params;
  const resolvedSearchParams = await searchParams;

  try {
    const publicUser = await getPublicUserByUsernameServer(username);
    const displayName = getPublicUserDisplayName(publicUser);
    const query = toWardrobeListQuery(resolvedSearchParams ?? {});
    const wardrobe = await getPublicWardrobeServer(displayName, query);
    const currentPage = getWardrobePage(query);
    const pageHref = userPageUrlBuilder.wardrobe(username);

    return (
      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-950">
            Р“Р°СЂРґРµСЂРѕР± {displayName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            РџСѓР±Р»С–С‡РЅС– Р°СЂРѕРјР°С‚Рё РєРѕСЂРёСЃС‚СѓРІР°С‡Р°, СЃС‚Р°С‚СѓСЃРё, РѕС†С–РЅРєРё С‚Р° РЅРѕС‚Р°С‚РєРё.
          </p>
        </header>

        <WardrobeListToolbar
          action={pageHref}
          query={query}
        />

        <WardrobeList
          items={wardrobe.results}
          emptyText="РЈ РїСѓР±Р»С–С‡РЅРѕРјСѓ РіР°СЂРґРµСЂРѕР±С– РїРѕРєРё РЅРµРјР°С” Р°СЂРѕРјР°С‚С–РІ."
          getFragranceHref={(item) => {
            return item.fragrance?.slug
              ? fragrancePageUrlBuilder.public.detail(item.fragrance.slug)
              : null;
          }}
          getActions={(item) => {
            if (item.status !== 'own' && item.status !== 'sample') {
              return null;
            }

            return (
              <Link
                href={exchangePageUrlBuilder.newForItem({
                  requested_type: 'wardrobe',
                  requested_id: item.id,
                  owner_id: publicUser.id,
                })}
                className="rounded-md border px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
              >
                Р—Р°РїСЂРѕРїРѕРЅСѓРІР°С‚Рё РѕР±РјС–РЅ
              </Link>
            );
          }}
        />

        <WardrobePagination
          currentPage={currentPage}
          hasNext={Boolean(wardrobe.next)}
          hasPrevious={Boolean(wardrobe.previous)}
          query={query}
          buildHref={(nextQuery) => userPageUrlBuilder.wardrobe(username, nextQuery)}
        />
      </main>
    );
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }

    throw error;
  }
}
