import type { Metadata } from 'next';
import Link from 'next/link';

import { homePageStyles as styles } from '@/app/components/home/home.styles';
import {
  getBrandsServer,
  getFamiliesServer,
  getFragrancesServer,
  getNotesServer,
  getPerfumersServer,
} from '@/app/services/fragranceServices.server';
import { fragrancePageUrlBuilder } from '@/app/urls/pageUrls/fragrancePageUrlBuilder';
import { sitePageUrlBuilder } from '@/app/urls/pageUrls/sitePageUrlBuilder';
import { buildSeoMetadata } from '@/app/utils/seoMetadata';

import type {
  Brand,
  FragranceListItem,
  Note,
  OlfactoryFamily,
  Perfumer,
} from '@/app/types/fragranceTypes';
import type { Paginated } from '@/app/types/http';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Aroma Navigator',
  description:
    'Р”РѕРІС–РґРЅРёРє Р°СЂРѕРјР°С‚С–РІ, Р±СЂРµРЅРґРё, РЅРѕС‚Рё, РїР°СЂС„СѓРјРµСЂРё, РіР°СЂРґРµСЂРѕР±, РѕР±РјС–РЅРё, СЃС‚Р°С‚С‚С– С‚Р° С„РѕСЂСѓРј РґР»СЏ РїР°СЂС„СѓРјРµСЂРЅРѕС— СЃРїС–Р»СЊРЅРѕС‚Рё.',
  path: '/',
});

async function safeResults<T>(
  loader: () => Promise<Paginated<T>>,
): Promise<T[]> {
  try {
    const data = await loader();
    return data.results;
  } catch {
    return [];
  }
}

function FragranceCard({ fragrance }: { fragrance: FragranceListItem }) {
  return (
    <Link
      href={fragrancePageUrlBuilder.public.detail(fragrance.slug)}
      className={styles.card}
    >
      <span className={styles.cardKicker}>{fragrance.brand.name}</span>
      <span className={styles.cardTitle}>{fragrance.name}</span>
      <span className={styles.cardMeta}>
        {fragrance.release_year
          ? `${fragrance.release_year} СЂС–Рє`
          : 'Р С–Рє РІРёРїСѓСЃРєСѓ СѓС‚РѕС‡РЅСЋС”С‚СЊСЃСЏ'}
      </span>
    </Link>
  );
}

function DictionarySection<T>({
  title,
  lead,
  href,
  items,
  getLabel,
  getHref,
}: {
  title: string;
  lead: string;
  href: string;
  items: T[];
  getLabel: (item: T) => string;
  getHref: (item: T) => string;
}) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <p className={styles.sectionLead}>{lead}</p>
        </div>
        <Link href={href} className={styles.sectionLink}>
          РџРµСЂРµРіР»СЏРЅСѓС‚Рё РІСЃС–
        </Link>
      </header>

      {items.length ? (
        <div className={styles.chipList}>
          {items.map((item) => (
            <Link key={getHref(item)} href={getHref(item)} className={styles.chip}>
              {getLabel(item)}
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>РџРѕРєРё РЅРµРјР°С” РґР°РЅРёС… РґР»СЏ С†СЊРѕРіРѕ СЂРѕР·РґС–Р»Сѓ.</p>
      )}
    </section>
  );
}

export default async function HomePage() {
  const [fragrances, brands, notes, families, perfumers] = await Promise.all([
    safeResults(() =>
      getFragrancesServer({
        ordering: '-likes',
        page_size: 6,
      }),
    ),
    safeResults(() =>
      getBrandsServer({
        ordering: 'name',
        page_size: 12,
      }),
    ),
    safeResults(() =>
      getNotesServer({
        ordering: 'name',
        page_size: 14,
      }),
    ),
    safeResults(() =>
      getFamiliesServer({
        ordering: 'name',
        page_size: 10,
      }),
    ),
    safeResults(() =>
      getPerfumersServer({
        ordering: 'name',
        page_size: 10,
      }),
    ),
  ]);

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <p className={styles.eyebrow}>РџР°СЂС„СѓРјРµСЂРЅР° СЃРїС–Р»СЊРЅРѕС‚Р°</p>
            <h1 className={styles.title}>Aroma Navigator</h1>
            <p className={styles.lead}>
              Р”РѕСЃР»С–РґР¶СѓР№С‚Рµ Р°СЂРѕРјР°С‚Рё, Р·Р±РёСЂР°Р№С‚Рµ РіР°СЂРґРµСЂРѕР±, РїРµСЂРµРіР»СЏРґР°Р№С‚Рµ РїСЂРѕРїРѕР·РёС†С–С—
              РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ, С‡РёС‚Р°Р№С‚Рµ СЃС‚Р°С‚С‚С– С‚Р° Р·РЅР°С…РѕРґСЊС‚Рµ РЅРѕС‚Рё, Р±СЂРµРЅРґРё Р№
              РїР°СЂС„СѓРјРµСЂС–РІ Сѓ С”РґРёРЅРѕРјСѓ РґРѕРІС–РґРЅРёРєСѓ.
            </p>

            <div className={styles.heroActions}>
              <Link
                href={fragrancePageUrlBuilder.public.list()}
                className={styles.primaryLink}
              >
                Р’С–РґРєСЂРёС‚Рё РґРѕРІС–РґРЅРёРє
              </Link>
              <Link
                href={sitePageUrlBuilder.public.forum()}
                className={styles.secondaryLink}
              >
                Р¤РѕСЂСѓРј СЃРїС–Р»СЊРЅРѕС‚Рё
              </Link>
            </div>
          </div>

          <aside className={styles.heroPanel}>
            <div>
              <h2 className={styles.panelTitle}>РЁРІРёРґРєРёР№ РїРµСЂРµС…С–Рґ</h2>
              <p className={styles.panelLead}>
                РћСЃРЅРѕРІРЅС– СЂРѕР·РґС–Р»Рё Р·Р°Р»РёС€Р°СЋС‚СЊСЃСЏ РѕРєСЂРµРјРёРјРё СЃС‚РѕСЂС–РЅРєР°РјРё, Р° СЃР»РѕРІРЅРёРєРё
                Р¶РёРІСѓС‚СЊ РІСЃРµСЂРµРґРёРЅС– РґРѕРІС–РґРЅРёРєР° Р°СЂРѕРјР°С‚С–РІ.
              </p>
            </div>

            <nav className={styles.quickGrid} aria-label="РћСЃРЅРѕРІРЅС– СЂРѕР·РґС–Р»Рё">
              <Link
                href={fragrancePageUrlBuilder.public.brands()}
                className={styles.quickLink}
              >
                Р‘СЂРµРЅРґРё <span>в†’</span>
              </Link>
              <Link
                href={fragrancePageUrlBuilder.public.notes()}
                className={styles.quickLink}
              >
                РќРѕС‚Рё <span>в†’</span>
              </Link>
              <Link
                href={fragrancePageUrlBuilder.public.families()}
                className={styles.quickLink}
              >
                РЎС–РјРµР№СЃС‚РІР° <span>в†’</span>
              </Link>
              <Link
                href={fragrancePageUrlBuilder.public.perfumers()}
                className={styles.quickLink}
              >
                РџР°СЂС„СѓРјРµСЂРё <span>в†’</span>
              </Link>
            </nav>
          </aside>
        </section>

        <section className={styles.sectionFlat}>
          <header className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>РџРѕРїСѓР»СЏСЂРЅС– Р°СЂРѕРјР°С‚Рё</h2>
              <p className={styles.sectionLead}>
                Р”РѕР±С–СЂРєР° Р· РґРѕРІС–РґРЅРёРєР° РґР»СЏ С€РІРёРґРєРѕРіРѕ СЃС‚Р°СЂС‚Сѓ.
              </p>
            </div>
            <Link
              href={fragrancePageUrlBuilder.public.list()}
              className={styles.sectionLink}
            >
              РЈСЃС– Р°СЂРѕРјР°С‚Рё
            </Link>
          </header>

          {fragrances.length ? (
            <div className={styles.cardsGrid}>
              {fragrances.map((fragrance) => (
                <FragranceCard key={fragrance.id} fragrance={fragrance} />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>РџРѕРєРё РЅРµРјР°С” Р°СЂРѕРјР°С‚С–РІ РґР»СЏ РїРѕРєР°Р·Сѓ.</p>
          )}
        </section>

        <div className={styles.dictionaryGrid}>
          <DictionarySection<Brand>
            title="Р‘СЂРµРЅРґРё"
            lead="РћРєСЂРµРјРёР№ СЃР»РѕРІРЅРёРє РґР»СЏ РїРѕС€СѓРєСѓ Р°СЂРѕРјР°С‚С–РІ Р·Р° РґРѕРјРѕРј."
            href={fragrancePageUrlBuilder.public.brands()}
            items={brands}
            getLabel={(brand) => brand.name}
            getHref={(brand) =>
              fragrancePageUrlBuilder.public.brandDetail(brand.slug)
            }
          />

          <DictionarySection<Note>
            title="РќРѕС‚Рё"
            lead="РЁРІРёРґРєРёР№ РІС…С–Рґ РґРѕ Р°РєРѕСЂРґС–РІ С– РїС–СЂР°РјС–Рґ Р°СЂРѕРјР°С‚С–РІ."
            href={fragrancePageUrlBuilder.public.notes()}
            items={notes}
            getLabel={(note) => note.name}
            getHref={(note) =>
              fragrancePageUrlBuilder.public.noteDetail(note.slug)
            }
          />

          <DictionarySection<OlfactoryFamily>
            title="РЎС–РјРµР№СЃС‚РІР°"
            lead="РљР»Р°СЃРёС„С–РєР°С†С–СЏ Р°СЂРѕРјР°С‚С–РІ РґР»СЏ РїС–РґР±РѕСЂСѓ Р·Р° РЅР°РїСЂСЏРјРѕРј."
            href={fragrancePageUrlBuilder.public.families()}
            items={families}
            getLabel={(family) => family.name}
            getHref={(family) =>
              fragrancePageUrlBuilder.public.familyDetail(family.slug)
            }
          />
        </div>

        <DictionarySection<Perfumer>
          title="РџР°СЂС„СѓРјРµСЂРё"
          lead="РђРІС‚РѕСЂРё Р°СЂРѕРјР°С‚С–РІ СЏРє РѕРєСЂРµРјРёР№ РЅР°РІС–РіР°С†С–Р№РЅРёР№ С€Р°СЂ РґРѕРІС–РґРЅРёРєР°."
          href={fragrancePageUrlBuilder.public.perfumers()}
          items={perfumers}
          getLabel={(perfumer) => perfumer.name}
          getHref={(perfumer) =>
            fragrancePageUrlBuilder.public.perfumerDetail(perfumer.id)
          }
        />

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Р©Рѕ С‰Рµ С” РЅР° РїР»Р°С‚С„РѕСЂРјС–</h2>
              <p className={styles.sectionLead}>
                Р”РѕРІС–РґРЅРёРє Р·Р°Р»РёС€Р°С”С‚СЊСЃСЏ С†РµРЅС‚СЂРѕРј, Р° РіР°СЂРґРµСЂРѕР±, РѕР±РјС–РЅРё, СЃС‚Р°С‚С‚С– Р№
                С„РѕСЂСѓРј РґРѕРїРѕРІРЅСЋСЋС‚СЊ Р№РѕРіРѕ РїСЂР°РєС‚РёС‡РЅРёРјРё СЃС†РµРЅР°СЂС–СЏРјРё.
              </p>
            </div>
          </header>

          <div className={styles.cardsGrid}>
            <Link href={sitePageUrlBuilder.private.profile()} className={styles.card}>
              <span className={styles.cardKicker}>Р“Р°СЂРґРµСЂРѕР±</span>
              <span className={styles.cardTitle}>РћСЃРѕР±РёСЃС‚Р° РєРѕР»РµРєС†С–СЏ Р°СЂРѕРјР°С‚С–РІ</span>
              <span className={styles.cardMeta}>
                Р—Р±РµСЂС–РіР°Р№С‚Рµ С„Р»Р°РєРѕРЅРё, РІСЂР°Р¶РµРЅРЅСЏ, СЃС‚Р°С‚СѓСЃРё С‚Р° РїСЂРёРІР°С‚РЅС– РЅРѕС‚Р°С‚РєРё Сѓ РїСЂРѕС„С–Р»С–.
              </span>
            </Link>
            <Link href={sitePageUrlBuilder.public.articles()} className={styles.card}>
              <span className={styles.cardKicker}>РЎС‚Р°С‚С‚С–</span>
              <span className={styles.cardTitle}>РњР°С‚РµСЂС–Р°Р»Рё РїСЂРѕ Р°СЂРѕРјР°С‚Рё</span>
              <span className={styles.cardMeta}>
                Р”РѕР±С–СЂРєРё, С‚РµРєСЃС‚Рё С‚Р° РґРѕРІС€С– РѕР±РіРѕРІРѕСЂРµРЅРЅСЏ РЅР°РІРєРѕР»Рѕ РїР°СЂС„СѓРјРµСЂРЅРѕС— РєСѓР»СЊС‚СѓСЂРё.
              </span>
            </Link>
            <Link href={sitePageUrlBuilder.public.forum()} className={styles.card}>
              <span className={styles.cardKicker}>РЎРїС–Р»СЊРЅРѕС‚Р°</span>
              <span className={styles.cardTitle}>Р¤РѕСЂСѓРј С– СЃС‚Р°С‚С‚С–</span>
              <span className={styles.cardMeta}>
                РћР±РіРѕРІРѕСЂРµРЅРЅСЏ, РґРѕР±С–СЂРєРё С‚Р° РјР°С‚РµСЂС–Р°Р»Рё РїСЂРѕ Р°СЂРѕРјР°С‚Рё.
              </span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
