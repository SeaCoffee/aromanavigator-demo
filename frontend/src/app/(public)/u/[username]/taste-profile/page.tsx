import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import Breadcrumbs from '@/app/components/common/Breadcrumbs';
import TasteProfileSummary from '@/app/components/taste-profile/TasteProfileSummary';
import { tasteProfileStyles as s } from '@/app/components/taste-profile/tasteProfile.styles';
import { getPublicTasteProfileServer } from '@/app/services/tasteProfileServices.server';
import { userPageUrlBuilder } from '@/app/urls/pageUrls/usersPageUrlBuilder';
import { buildSeoMetadata, truncateSeoText } from '@/app/utils/seoMetadata';

type PageProps = {
  params: Promise<{
    username: string;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const profile = await getPublicTasteProfileServer(username).catch(() => null);

  if (!profile) {
    return buildSeoMetadata({
      title: 'РџР°СЂС„СѓРјРµСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ РЅРµ Р·РЅР°Р№РґРµРЅРѕ',
      description: 'РџСѓР±Р»С–С‡РЅРёР№ РїР°СЂС„СѓРјРµСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ РєРѕСЂРёСЃС‚СѓРІР°С‡Р° РЅРµ Р·РЅР°Р№РґРµРЅРѕ.',
      path: userPageUrlBuilder.tasteProfile(username),
      noIndex: true,
    });
  }

  const displayName = profile.display_name || username;

  return buildSeoMetadata({
    title: `РџР°СЂС„СѓРјРµСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ ${displayName}`,
    description: truncateSeoText(
      profile.about ||
        `РЎРјР°РєРѕРІРёР№ РїСЂРѕС„С–Р»СЊ ${displayName}: СѓР»СЋР±Р»РµРЅС– РЅРѕС‚Рё, СЃС–РјРµР№СЃС‚РІР°, Р±СЂРµРЅРґРё, РїР°СЂС„СѓРјРµСЂРё С‚Р° Р°СЂРѕРјР°С‚Рё.`,
    ),
    path: userPageUrlBuilder.tasteProfile(username),
    keywords: [
      displayName,
      'РїР°СЂС„СѓРјРµСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ',
      'СЃРјР°РєРѕРІРёР№ РїСЂРѕС„С–Р»СЊ Р°СЂРѕРјР°С‚С–РІ',
      'СѓР»СЋР±Р»РµРЅС– РЅРѕС‚Рё',
      'СѓР»СЋР±Р»РµРЅС– Р±СЂРµРЅРґРё Р°СЂРѕРјР°С‚С–РІ',
    ],
  });
}

export default async function PublicTasteProfilePage({ params }: PageProps) {
  const { username } = await params;
  const profile = await getPublicTasteProfileServer(username).catch(() => null);

  if (!profile) {
    notFound();
  }

  return (
    <main className={s.page}>
      <Breadcrumbs
        items={[
          { label: 'Р“РѕР»РѕРІРЅР°', href: '/' },
          {
            label: profile.display_name || username,
            href: userPageUrlBuilder.publicProfile(username),
          },
          { label: 'РџР°СЂС„СѓРјРµСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ' },
        ]}
      />

      <header className={s.header}>
        <h1 className={s.title}>
          РџР°СЂС„СѓРјРµСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ {profile.display_name || username}
        </h1>

        <p className={s.subtitle}>
          РџСѓР±Р»С–С‡РЅС– СЃРјР°РєРѕРІС– РѕСЂС–С”РЅС‚РёСЂРё РєРѕСЂРёСЃС‚СѓРІР°С‡Р°: С‰Рѕ РїРѕРґРѕР±Р°С”С‚СЊСЃСЏ, С‡РѕРіРѕ РєСЂР°С‰Рµ РЅРµ
          РїСЂРѕРїРѕРЅСѓРІР°С‚Рё, СЏРєС– РЅРѕС‚Рё, СЃС–РјРµР№СЃС‚РІР°, Р±СЂРµРЅРґРё, РїР°СЂС„СѓРјРµСЂРё Р№ Р°СЂРѕРјР°С‚Рё
          РєРѕСЂРёСЃС‚СѓРІР°С‡ РІРёРґС–Р»СЏС”.
        </p>

        <nav className={s.tabs}>
          <Link className={s.tabLink} href={userPageUrlBuilder.wardrobe(username)}>
            Р“Р°СЂРґРµСЂРѕР±
          </Link>

          <Link
            className={s.tabLink}
            href={userPageUrlBuilder.publicProfile(username)}
          >
            РџСЂРѕС„С–Р»СЊ РєРѕСЂРёСЃС‚СѓРІР°С‡Р°
          </Link>
        </nav>
      </header>

      <TasteProfileSummary profile={profile} />
    </main>
  );
}
