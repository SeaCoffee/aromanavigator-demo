import type { Metadata } from 'next';

import Link from 'next/link';

import ArticleForm from '@/app/components/articles/ArticleForm';
import { requireUserOrRedirect } from '@/app/lib/session';
import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';

export const metadata: Metadata = {
  title: 'РќРѕРІР° СЃС‚Р°С‚С‚СЏ',
};

export default async function CreateArticlePage() {
  await requireUserOrRedirect();

  return (
    <main className="min-h-screen bg-[#fbf7f2] text-[#241b19]">
      <div className="mx-auto grid w-full max-w-[900px] gap-6 px-4 py-8 sm:px-6">
        <header className="grid gap-4">
          <Link
            href={articlesPageUrlBuilder.me.list()}
            className="w-fit text-sm font-bold text-[#9b6847] underline underline-offset-4 transition hover:text-[#641f32]"
          >
            в†ђ Р”Рѕ РјРѕС—С… СЃС‚Р°С‚РµР№
          </Link>

          <div className="grid gap-2">
            <h1 className="font-serif text-[36px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#2b211d] md:text-[46px]">
              РќРѕРІР° СЃС‚Р°С‚С‚СЏ
            </h1>

            <p className="max-w-[680px] text-sm font-medium leading-6 text-[#7a6d64]">
              РќР°РїРёС€С–С‚СЊ РјР°С‚РµСЂС–Р°Р», РґРѕРґР°Р№С‚Рµ РѕР±РєР»Р°РґРёРЅРєСѓ Р№ С„РѕС‚Рѕ РІ С‚РµРєСЃС‚, Р·Р±РµСЂРµР¶С–С‚СЊ СЏРє
              С‡РµСЂРЅРµС‚РєСѓ Р°Р±Рѕ РІС–РґРїСЂР°РІС‚Рµ РЅР° РјРѕРґРµСЂР°С†С–СЋ.
            </p>
          </div>
        </header>

        <ArticleForm
          mode="create"
          successHref={articlesPageUrlBuilder.me.list()}
          successLinkLabel="РџРѕРІРµСЂРЅСѓС‚РёСЃСЏ РґРѕ РјРѕС—С… СЃС‚Р°С‚РµР№"
        />
      </div>
    </main>
  );
}
