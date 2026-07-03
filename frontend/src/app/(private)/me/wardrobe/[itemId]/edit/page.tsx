import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import WardrobeForm from '@/app/components/wardrobe/WardrobeForm';
import { requireUserOrRedirect } from '@/app/lib/session';
import { getMyWardrobeItemServer } from '@/app/services/wardrobeServices.server';
import type { ID } from '@/app/types/http';
import { wardrobePageUrlBuilder } from '@/app/urls/pageUrls/wardrobePageUrlBuilder';

export const metadata: Metadata = {
  title: 'Р РµРґР°РіСѓРІР°С‚Рё Р°СЂРѕРјР°С‚ Сѓ РіР°СЂРґРµСЂРѕР±С–',
};

type Props = {
  params: Promise<{
    itemId: string;
  }>;
};

function normalizeItemId(value: string): ID {
  const itemId = Number(value);

  if (!Number.isInteger(itemId) || itemId <= 0) {
    notFound();
  }

  return itemId;
}

export default async function EditWardrobeItemPage({
  params,
}: Props) {
  await requireUserOrRedirect();

  const { itemId: rawItemId } = await params;
  const itemId = normalizeItemId(rawItemId);
  const item = await getMyWardrobeItemServer(itemId);

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
            Р РµРґР°РіСѓРІР°С‚Рё Р°СЂРѕРјР°С‚
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            РћРЅРѕРІС–С‚СЊ СЃС‚Р°С‚СѓСЃ, РѕС†С–РЅРєСѓ, РЅРѕС‚Р°С‚РєРё Р°Р±Рѕ РїСЂРёРІР°С‚РЅС–СЃС‚СЊ Р·Р°РїРёСЃСѓ.
          </p>
        </div>
      </div>

      <WardrobeForm
        mode="edit"
        initialItem={item}
        successHref={wardrobePageUrlBuilder.me.list()}
        successLinkLabel="РџРѕРІРµСЂРЅСѓС‚РёСЃСЏ РґРѕ РіР°СЂРґРµСЂРѕР±Р°"
      />
    </main>
  );
}
