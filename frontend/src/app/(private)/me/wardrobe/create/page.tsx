import type { Metadata } from 'next';
import Link from 'next/link';

import WardrobeForm from '@/app/components/wardrobe/WardrobeForm';
import { requireUserOrRedirect } from '@/app/lib/session';
import { wardrobePageUrlBuilder } from '@/app/urls/pageUrls/wardrobePageUrlBuilder';

export const metadata: Metadata = {
  title: 'Р”РѕРґР°С‚Рё Р°СЂРѕРјР°С‚ РґРѕ РіР°СЂРґРµСЂРѕР±Р°',
};

export default async function CreateWardrobeItemPage() {
  await requireUserOrRedirect();

  return (
    <main className="mx-auto grid max-w-3xl gap-6 px-4 py-6">
      <div className="grid gap-3">
        <Link
          href={wardrobePageUrlBuilder.me.list()}
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          в†ђ Р”Рѕ РіР°СЂРґРµСЂРѕР±Р°
        </Link>

        <div>
          <h1 className="text-2xl font-semibold text-gray-950">
            Р”РѕРґР°С‚Рё Р°СЂРѕРјР°С‚ РґРѕ РіР°СЂРґРµСЂРѕР±Р°
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            РћР±РµСЂС–С‚СЊ Р°СЂРѕРјР°С‚ Р· РµРЅС†РёРєР»РѕРїРµРґС–С— С‚Р° РґРѕРґР°Р№С‚Рµ СЃРІС–Р№ СЃС‚Р°С‚СѓСЃ, РѕС†С–РЅРєСѓ Р°Р±Рѕ РЅРѕС‚Р°С‚РєРё.
          </p>
        </div>
      </div>

      <WardrobeForm
        mode="create"
        successHref={wardrobePageUrlBuilder.me.list()}
        successLinkLabel="РџРѕРІРµСЂРЅСѓС‚РёСЃСЏ РґРѕ РіР°СЂРґРµСЂРѕР±Р°"
      />
    </main>
  );
}
