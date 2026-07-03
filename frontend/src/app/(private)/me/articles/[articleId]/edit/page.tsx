import type { Metadata } from 'next';

import Link from 'next/link';
import { notFound } from 'next/navigation';

import ArticleForm from '@/app/components/articles/ArticleForm';
import { requireUserOrRedirect } from '@/app/lib/session';
import { getMyArticleServer } from '@/app/services/articleServices.server';
import type { ID } from '@/app/types/userTypes';
import { articlesPageUrlBuilder } from '@/app/urls/pageUrls/articlesPageUrlBuilder';

export const metadata: Metadata = {
  title: 'Р РµРґР°РіСѓРІР°С‚Рё СЃС‚Р°С‚С‚СЋ',
};

type Props = {
  params: Promise<{
    articleId: string;
  }>;
};

function normalizeArticleId(value: string): ID {
  const articleId = Number(value);

  if (!Number.isInteger(articleId) || articleId <= 0) {
    notFound();
  }

  return articleId;
}

export default async function EditArticlePage({ params }: Props) {
  await requireUserOrRedirect();

  const { articleId: rawArticleId } = await params;
  const articleId = normalizeArticleId(rawArticleId);
  const article = await getMyArticleServer(articleId);

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
              Р РµРґР°РіСѓРІР°С‚Рё СЃС‚Р°С‚С‚СЋ
            </h1>

            <p className="max-w-[680px] text-sm font-medium leading-6 text-[#7a6d64]">
              РћРЅРѕРІС–С‚СЊ Р·Р°РіРѕР»РѕРІРѕРє, С‚РµРєСЃС‚, РѕР±РєР»Р°РґРёРЅРєСѓ, С„РѕС‚Рѕ РІ С‚РµРєСЃС‚С–, С‚РµРіРё Р°Р±Рѕ
              СЃС‚Р°С‚СѓСЃ РјР°С‚РµСЂС–Р°Р»Сѓ.
            </p>
          </div>
        </header>

        <ArticleForm
          mode="edit"
          initialArticle={article}
          successHref={articlesPageUrlBuilder.me.list()}
          successLinkLabel="РџРѕРІРµСЂРЅСѓС‚РёСЃСЏ РґРѕ РјРѕС—С… СЃС‚Р°С‚РµР№"
        />
      </div>
    </main>
  );
}
