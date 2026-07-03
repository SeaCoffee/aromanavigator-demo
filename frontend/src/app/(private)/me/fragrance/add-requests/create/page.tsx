import type { Metadata } from 'next';
import Link from 'next/link';

import FragranceAddRequestForm from '@/app/components/fragrances/ugc/FragranceAddRequestForm';
import { requireUserOrRedirect } from '@/app/lib/session';
import { fragranceUgcPageUrlBuilder } from '@/app/urls/pageUrls/fragranceUgcPageUrlBuilder';

export const metadata: Metadata = {
  title: 'Р—Р°РїСЂРѕРїРѕРЅСѓРІР°С‚Рё Р°СЂРѕРјР°С‚',
};

export default async function CreateFragranceAddRequestPage() {
  await requireUserOrRedirect();

  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-8">
      <header>
        <Link
          href={fragranceUgcPageUrlBuilder.me.addRequests()}
          className="text-sm font-semibold text-[#6f3f2f] underline-offset-4 hover:underline"
        >
          РњРѕС— Р·Р°СЏРІРєРё
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-neutral-950">
          Р—Р°РїСЂРѕРїРѕРЅСѓРІР°С‚Рё Р°СЂРѕРјР°С‚
        </h1>
      </header>

      <section className="rounded-2xl border border-[#e2d5ca] bg-white p-5 shadow-sm sm:p-7">
        <FragranceAddRequestForm />
      </section>
    </main>
  );
}
