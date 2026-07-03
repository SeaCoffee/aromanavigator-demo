import type { Metadata } from 'next';
import Link from 'next/link';

import { buttonStyles } from '@/app/components/common/buttonStyles';
import FragrancePagination from '@/app/components/fragrances/FragrancePagination';
import { requireUserOrRedirect } from '@/app/lib/session';
import { getMyFragranceAddRequestsServer } from '@/app/services/fragranceUgcService.server';
import type {
  FragranceAddRequest,
  ModerationStatus,
} from '@/app/types/fragranceTypes';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { fragranceUgcPageUrlBuilder } from '@/app/urls/pageUrls/fragranceUgcPageUrlBuilder';
import type { PageSearchParams } from '@/app/utils/searchParamsUtils';

export const metadata: Metadata = {
  title: 'РњРѕС— Р·Р°СЏРІРєРё РЅР° РґРѕРґР°РІР°РЅРЅСЏ Р°СЂРѕРјР°С‚С–РІ',
};

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<ModerationStatus, string> = {
  pending: 'РќР° РїРµСЂРµРІС–СЂС†С–',
  approved: 'РЎС…РІР°Р»РµРЅРѕ',
  rejected: 'Р’С–РґС…РёР»РµРЅРѕ',
};

function readPage(value: unknown) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function requestTitle(item: FragranceAddRequest) {
  return `${item.brand_name} вЂ” ${item.fragrance_name}`;
}

type Props = {
  searchParams?: Promise<PageSearchParams>;
};

export default async function MyFragranceAddRequestsPage({
  searchParams,
}: Props) {
  await requireUserOrRedirect();

  const params = (await searchParams) ?? {};
  const page = readPage(params.page);
  const data = await getMyFragranceAddRequestsServer({
    page,
    page_size: PAGE_SIZE,
  });

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-950">
            РњРѕС— Р·Р°СЏРІРєРё РЅР° РґРѕРґР°РІР°РЅРЅСЏ Р°СЂРѕРјР°С‚С–РІ
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            РўСѓС‚ РІРёРґРЅРѕ СЃС‚Р°С‚СѓСЃ РїРµСЂРµРІС–СЂРєРё С‚Р° РІС–РґРїРѕРІС–РґСЊ РјРѕРґРµСЂР°С‚РѕСЂР°.
          </p>
        </div>
        <Link
          href={fragranceUgcPageUrlBuilder.me.createAddRequest()}
          className={buttonStyles.primary}
        >
          РќРѕРІР° Р·Р°СЏРІРєР°
        </Link>
      </header>

      {data.results.length ? (
        <section className="grid gap-4">
          {data.results.map((item) => (
            <article
              key={String(item.id)}
              className="grid gap-3 rounded-2xl border border-[#e2d5ca] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-neutral-950">
                    {requestTitle(item)}
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {item.release_year ?? 'Р С–Рє РЅРµ РІРєР°Р·Р°РЅРѕ'}
                  </p>
                </div>
                <span className="rounded-full bg-[#f2e8df] px-3 py-1 text-sm font-semibold text-[#68483b]">
                  {STATUS_LABELS[item.status]}
                </span>
              </div>

              {item.moderator_comment ? (
                <div className="rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700">
                  <strong>РљРѕРјРµРЅС‚Р°СЂ РјРѕРґРµСЂР°С‚РѕСЂР°:</strong>{' '}
                  {item.moderator_comment}
                </div>
              ) : null}

              {item.created_fragrance ? (
                <Link
                  href={fragrancePageUrlBuilder.public.detail(
                    item.created_fragrance.slug,
                  )}
                  className="w-fit text-sm font-semibold text-[#6f3f2f] underline-offset-4 hover:underline"
                >
                  Р’С–РґРєСЂРёС‚Рё РґРѕРґР°РЅРёР№ Р°СЂРѕРјР°С‚
                </Link>
              ) : null}
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-[#d8c8bb] bg-white p-8 text-center text-neutral-600">
          Р’Рё С‰Рµ РЅРµ РЅР°РґСЃРёР»Р°Р»Рё Р·Р°СЏРІРѕРє.
        </section>
      )}

      <FragrancePagination
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={data.count}
        hrefForPage={(nextPage) =>
          fragranceUgcPageUrlBuilder.me.addRequests({ page: nextPage })
        }
      />
    </main>
  );
}
