'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import {
  createFaqAction,
  deleteFaqAction,
  updateFaqAction,
  updateSiteContactsAction,
  updateSitePageAction,
} from '@/app/actions/siteContentActions';
import {
  actionResultMessage,
  isSuccessMessage,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';
import type {
  SiteContactSettings,
  SiteFaq,
  SitePage,
  SitePageSlug,
} from '@/app/types/siteContentTypes';

const input = 'rounded-xl border border-[#d8cec5] bg-white px-3 py-2.5 text-sm text-[#2b211c]';
const textarea = `${input} min-h-28 resize-y`;
const card = 'grid gap-4 rounded-2xl border border-[#e2d8cf] bg-white p-5 shadow-sm';
const mutedText = 'text-xs leading-5 text-[#7a6d64]';

type EditableFooterItem = {
  label: string;
  slug?: SitePageSlug;
  href?: string;
};

const editableFooterSections: Array<{
  title: string;
  items: EditableFooterItem[];
}> = [
  {
    title: 'aromaNavigator',
    items: [
      { label: 'РџСЂРѕ СЃР°Р№С‚', slug: 'about' },
      { label: 'РџСЂРѕ Р±Р°Р·Сѓ Р°СЂРѕРјР°С‚С–РІ', slug: 'fragrance-database' },
      { label: 'FAQ', href: '/faq' },
      { label: 'РЎРїС–РІРїСЂР°С†СЏ', slug: 'cooperation' },
    ],
  },
  {
    title: 'РЎРїС–Р»СЊРЅРѕС‚Р°',
    items: [
      { label: 'Р¤РѕСЂСѓРј', href: '/forum' },
      { label: 'РџСЂР°РІРёР»Р° С„РѕСЂСѓРјСѓ', slug: 'forum-rules' },
      { label: 'РџРµСЂРµРІС–СЂРєР° РѕСЂРёРіС–РЅР°Р»СЊРЅРѕСЃС‚С–', slug: 'authenticity-check' },
    ],
  },
  {
    title: 'РџРѕРєСѓРїС†СЏРј С– РїСЂРѕРґР°РІС†СЏРј',
    items: [
      { label: 'РћР±РјС–РЅ С– РїРѕРІРµСЂРЅРµРЅРЅСЏ', slug: 'exchange-return' },
    ],
  },
  {
    title: 'РџСЂР°РІРѕРІР° С–РЅС„РѕСЂРјР°С†С–СЏ',
    items: [
      { label: 'РџСЂР°РІРёР»Р° РєРѕСЂРёСЃС‚СѓРІР°РЅРЅСЏ', slug: 'terms' },
      { label: 'РџРѕР»С–С‚РёРєР° РєРѕРЅС„С–РґРµРЅС†С–Р№РЅРѕСЃС‚С–', slug: 'privacy' },
      { label: 'РљРѕРЅС‚Р°РєС‚Рё', slug: 'contacts' },
    ],
  },
];

function Result({ state }: { state: Parameters<typeof actionResultMessage>[0] | null }) {
  if (!state) return null;
  const message = actionResultMessage(state);
  return <p className={isSuccessMessage(message) ? 'text-sm text-emerald-700' : 'text-sm text-red-700'}>{message}</p>;
}

function publicPathForPage(slug: SitePageSlug) {
  if (slug === 'about') return '/about';
  if (slug === 'terms') return '/terms';
  if (slug === 'privacy') return '/privacy';
  if (slug === 'contacts') return '/contacts';
  return `/info/${slug}`;
}

function ContactsForm({ settings }: { settings: SiteContactSettings }) {
  const [state, action, pending] = useActionState(updateSiteContactsAction, null);

  return (
    <form action={action} className={card}>
      <h2 className="text-xl font-semibold">Р¤СѓС‚РµСЂ С– РєРѕРЅС‚Р°РєС‚Рё</h2>

      <label className="grid gap-1 text-sm">
        РўРµРєСЃС‚ РїС–Рґ Р»РѕРіРѕС‚РёРїРѕРј Сѓ С„СѓС‚РµСЂС–
        <textarea className={textarea} defaultValue={settings.footer_text} name="footer_text" />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Email
          <input className={input} defaultValue={settings.contact_email} name="contact_email" type="email" />
        </label>
        <label className="grid gap-1 text-sm">
          РўРµР»РµС„РѕРЅ
          <input className={input} defaultValue={settings.contact_phone} name="contact_phone" />
        </label>
        <label className="grid gap-1 text-sm">
          РђРґСЂРµСЃР° / РґРѕРґР°С‚РєРѕРІРёР№ С‚РµРєСЃС‚
          <input className={input} defaultValue={settings.contact_address} name="contact_address" />
        </label>
        <label className="grid gap-1 text-sm">
          Р“РѕРґРёРЅРё РїС–РґС‚СЂРёРјРєРё
          <input className={input} defaultValue={settings.support_hours} name="support_hours" />
        </label>
        <label className="grid gap-1 text-sm">
          Instagram
          <input className={input} defaultValue={settings.instagram_url} name="instagram_url" type="url" />
        </label>
        <label className="grid gap-1 text-sm">
          Facebook
          <input className={input} defaultValue={settings.facebook_url} name="facebook_url" type="url" />
        </label>
        <label className="grid gap-1 text-sm">
          Telegram
          <input className={input} defaultValue={settings.telegram_url} name="telegram_url" type="url" />
        </label>
      </div>

      <button className="w-fit rounded-xl bg-[#344a52] px-4 py-2 text-sm font-semibold text-white" disabled={pending}>
        Р—Р±РµСЂРµРіС‚Рё С„СѓС‚РµСЂ С– РєРѕРЅС‚Р°РєС‚Рё
      </button>
      <Result state={state} />
    </form>
  );
}

function PageForm({ page, footerLabel }: { page: SitePage; footerLabel?: string }) {
  const [state, action, pending] = useActionState(updateSitePageAction, null);

  return (
    <form action={action} className={card}>
      <input name="slug" type="hidden" value={page.slug} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6847]">
            РџСѓРЅРєС‚ С„СѓС‚РµСЂР°: {footerLabel ?? page.slug_label}
          </p>
          <h3 className="mt-1 text-lg font-semibold">{page.slug_label}</h3>
          <Link className="mt-1 inline-flex text-xs font-semibold text-[#6f7f85] hover:text-[#344a52]" href={publicPathForPage(page.slug)} target="_blank">
            Р’С–РґРєСЂРёС‚Рё РЅР° СЃР°Р№С‚С–
          </Link>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input defaultChecked={page.is_published} name="is_published" type="checkbox" /> РћРїСѓР±Р»С–РєРѕРІР°РЅР°
        </label>
      </div>
      <label className="grid gap-1 text-sm">
        Р—Р°РіРѕР»РѕРІРѕРє СЃС‚РѕСЂС–РЅРєРё
        <input className={input} defaultValue={page.title} name="title" required />
      </label>
      <label className="grid gap-1 text-sm">
        РўРµРєСЃС‚ СЃС‚РѕСЂС–РЅРєРё
        <textarea className={`${textarea} min-h-48`} defaultValue={page.body} name="body" />
      </label>
      <button className="w-fit rounded-xl bg-[#344a52] px-4 py-2 text-sm font-semibold text-white" disabled={pending}>
        Р—Р±РµСЂРµРіС‚Рё СЃС‚РѕСЂС–РЅРєСѓ
      </button>
      <Result state={state} />
    </form>
  );
}

function FooterPagesSection({ pages }: { pages: SitePage[] }) {
  const pagesBySlug = new Map(pages.map((page) => [page.slug, page]));

  return (
    <section className="grid gap-5">
      <div>
        <h2 className="text-xl font-semibold">РЎС‚РѕСЂС–РЅРєРё Р· С„СѓС‚РµСЂР°</h2>
        <p className={mutedText}>
          РўСѓС‚ СЂРµРґР°РіСѓС”С‚СЊСЃСЏ С‚РµРєСЃС‚ СЃС‚РѕСЂС–РЅРѕРє, РЅР° СЏРєС– РІРµРґСѓС‚СЊ РїСѓРЅРєС‚Рё С„СѓС‚РµСЂР°. РџСѓРЅРєС‚Рё FAQ С– Р¤РѕСЂСѓРј СЂРµРґР°РіСѓСЋС‚СЊСЃСЏ РІ РѕРєСЂРµРјРёС… СЂРѕР·РґС–Р»Р°С….
        </p>
      </div>
      {editableFooterSections.map((section) => (
        <section className="grid gap-4 rounded-2xl border border-[#eee5dc] bg-[#fbf7f2] p-4" key={section.title}>
          <h3 className="text-base font-semibold">{section.title}</h3>
          {section.items.map((item) => {
            if (!item.slug) {
              return (
                <div className="rounded-2xl border border-dashed border-[#d8cec5] bg-white p-4 text-sm text-[#6f6258]" key={item.label}>
                  <span className="font-semibold">{item.label}</span> вЂ” РѕРєСЂРµРјРёР№ С„СѓРЅРєС†С–РѕРЅР°Р»СЊРЅРёР№ СЂРѕР·РґС–Р», РЅРµ С‚РµРєСЃС‚РѕРІР° СЃС‚РѕСЂС–РЅРєР°.
                </div>
              );
            }

            const page = pagesBySlug.get(item.slug);
            if (!page) {
              return (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" key={item.slug}>
                  РќРµРјР°С” СЃС‚РѕСЂС–РЅРєРё РґР»СЏ РїСѓРЅРєС‚Сѓ вЂњ{item.label}вЂќ. РџРѕС‚СЂС–Р±РЅРѕ Р·Р°СЃС‚РѕСЃСѓРІР°С‚Рё backend-РјС–РіСЂР°С†С–С—.
                </div>
              );
            }

            return <PageForm footerLabel={item.label} key={item.slug} page={page} />;
          })}
        </section>
      ))}
    </section>
  );
}

function FaqCreateForm() {
  const [state, action, pending] = useActionState(createFaqAction, null);

  return (
    <form action={action} className={card}>
      <h3 className="text-lg font-semibold">Р”РѕРґР°С‚Рё РїРёС‚Р°РЅРЅСЏ</h3>
      <label className="grid gap-1 text-sm">
        РџРёС‚Р°РЅРЅСЏ
        <input className={input} name="question" required />
      </label>
      <label className="grid gap-1 text-sm">
        Р’С–РґРїРѕРІС–РґСЊ
        <textarea className={textarea} name="answer" required />
      </label>
      <div className="flex flex-wrap items-center gap-5">
        <label className="grid gap-1 text-sm">
          РџРѕР·РёС†С–СЏ
          <input className={`${input} w-28`} defaultValue="0" min="0" name="position" type="number" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input defaultChecked name="is_active" type="checkbox" /> РђРєС‚РёРІРЅРµ
        </label>
      </div>
      <button className="w-fit rounded-xl bg-[#344a52] px-4 py-2 text-sm font-semibold text-white" disabled={pending}>
        Р”РѕРґР°С‚Рё
      </button>
      <Result state={state} />
    </form>
  );
}

function FaqEditForm({ item }: { item: SiteFaq }) {
  const [state, action, pending] = useActionState(updateFaqAction, null);

  return (
    <div className={card}>
      <form action={action} className="grid gap-3">
        <input name="id" type="hidden" value={item.id} />
        <label className="grid gap-1 text-sm">
          РџРёС‚Р°РЅРЅСЏ
          <input className={input} defaultValue={item.question} name="question" required />
        </label>
        <label className="grid gap-1 text-sm">
          Р’С–РґРїРѕРІС–РґСЊ
          <textarea className={textarea} defaultValue={item.answer} name="answer" required />
        </label>
        <div className="flex flex-wrap items-center gap-5">
          <label className="grid gap-1 text-sm">
            РџРѕР·РёС†С–СЏ
            <input className={`${input} w-28`} defaultValue={item.position} min="0" name="position" type="number" />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input defaultChecked={item.is_active} name="is_active" type="checkbox" /> РђРєС‚РёРІРЅРµ
          </label>
        </div>
        <button className="w-fit rounded-xl border border-[#8599a0] px-4 py-2 text-sm font-semibold text-[#2b211c]" disabled={pending}>
          РћРЅРѕРІРёС‚Рё
        </button>
        <Result state={state} />
      </form>
      <form action={deleteFaqAction}>
        <input name="id" type="hidden" value={item.id} />
        <button className="text-sm font-semibold text-red-700" type="submit">
          Р’РёРґР°Р»РёС‚Рё РїРёС‚Р°РЅРЅСЏ
        </button>
      </form>
    </div>
  );
}

export default function AdminSiteContentForms({
  settings,
  pages,
  faq,
}: {
  settings: SiteContactSettings;
  pages: SitePage[];
  faq: SiteFaq[];
}) {
  return (
    <div className="grid gap-8">
      <ContactsForm settings={settings} />
      <FooterPagesSection pages={pages} />
      <section className="grid gap-4">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <FaqCreateForm />
        {faq.map((item) => <FaqEditForm item={item} key={item.id} />)}
      </section>
    </div>
  );
}
