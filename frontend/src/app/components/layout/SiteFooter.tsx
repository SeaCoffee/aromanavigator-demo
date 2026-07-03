'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { PublicSiteContent } from '@/app/types/siteContentTypes';

type FooterSection = {
  title: string;
  links: Array<{
    href: string;
    label: string;
  }>;
};

const footerSections: FooterSection[] = [
  {
    title: 'aromaNavigator',
    links: [
      { href: '/about', label: 'РџСЂРѕ СЃР°Р№С‚' },
      { href: '/info/fragrance-database', label: 'РџСЂРѕ Р±Р°Р·Сѓ Р°СЂРѕРјР°С‚С–РІ' },
      { href: '/faq', label: 'FAQ' },
      { href: '/info/cooperation', label: 'РЎРїС–РІРїСЂР°С†СЏ' },
    ],
  },
  {
    title: 'РЎРїС–Р»СЊРЅРѕС‚Р°',
    links: [
      { href: '/forum', label: 'Р¤РѕСЂСѓРј' },
      { href: '/info/forum-rules', label: 'РџСЂР°РІРёР»Р° С„РѕСЂСѓРјСѓ' },
      { href: '/info/authenticity-check', label: 'РџРµСЂРµРІС–СЂРєР° РѕСЂРёРіС–РЅР°Р»СЊРЅРѕСЃС‚С–' },
    ],
  },
  {
    title: 'РџРѕРєСѓРїС†СЏРј С– РїСЂРѕРґР°РІС†СЏРј',
    links: [
      { href: '/info/exchange-return', label: 'РћР±РјС–РЅ С– РїРѕРІРµСЂРЅРµРЅРЅСЏ' },
    ],
  },
  {
    title: 'РџСЂР°РІРѕРІР° С–РЅС„РѕСЂРјР°С†С–СЏ',
    links: [
      { href: '/terms', label: 'РџСЂР°РІРёР»Р° РєРѕСЂРёСЃС‚СѓРІР°РЅРЅСЏ' },
      { href: '/privacy', label: 'РџРѕР»С–С‚РёРєР° РєРѕРЅС„С–РґРµРЅС†С–Р№РЅРѕСЃС‚С–' },
      { href: '/contacts', label: 'РљРѕРЅС‚Р°РєС‚Рё' },
    ],
  },
];

function FooterLinks({ section }: { section: FooterSection }) {
  return (
    <nav aria-label={section.title} className="grid content-start gap-2 text-sm">
      <h2 className="mb-1 font-semibold text-white">{section.title}</h2>
      {section.links.map((link) => (
        <Link className="text-[#d8cbc0] transition hover:text-white" href={link.href} key={link.href}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export default function SiteFooter({ content }: { content: PublicSiteContent }) {
  const pathname = usePathname();
  const contacts = content.contacts;

  if (pathname.startsWith('/admin')) return null;

  const socialLinks = [
    { href: contacts.instagram_url, label: 'Instagram' },
    { href: contacts.facebook_url, label: 'Facebook' },
    { href: contacts.telegram_url, label: 'Telegram' },
  ].filter((item) => item.href);

  const hasContacts = Boolean(
    contacts.contact_email ||
      contacts.contact_phone ||
      contacts.contact_address ||
      contacts.support_hours ||
      socialLinks.length,
  );

  return (
    <footer className="mt-16 border-t border-[#e4d8cc] bg-[#2d2421] text-[#f8f1e9]">
      <div className="mx-auto grid w-full max-w-[1136px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(220px,1.25fr)_minmax(0,3fr)]">
        <div className="grid content-start gap-4">
          <Link className="font-serif text-2xl font-semibold" href="/">
            AromaNavigator
          </Link>
          <p className="max-w-md text-sm leading-6 text-[#d8cbc0]">
            {contacts.footer_text ||
              'РџСЂРѕСЃС‚С–СЂ РґР»СЏ С‚РёС…, С…С‚Рѕ РґРѕСЃР»С–РґР¶СѓС” Р°СЂРѕРјР°С‚Рё, РґС–Р»РёС‚СЊСЃСЏ РґРѕСЃРІС–РґРѕРј С– Р·РЅР°С…РѕРґРёС‚СЊ СЃРІРѕС— РїР°СЂС„СѓРјРµСЂРЅС– С–СЃС‚РѕСЂС–С—.'}
          </p>

          {hasContacts ? (
            <div className="grid gap-2 text-sm text-[#d8cbc0]">
              {contacts.contact_email ? (
                <a className="transition hover:text-white" href={`mailto:${contacts.contact_email}`}>
                  {contacts.contact_email}
                </a>
              ) : null}
              {contacts.contact_phone ? (
                <a className="transition hover:text-white" href={`tel:${contacts.contact_phone.replace(/\s/g, '')}`}>
                  {contacts.contact_phone}
                </a>
              ) : null}
              {contacts.contact_address ? <span>{contacts.contact_address}</span> : null}
              {contacts.support_hours ? <span>{contacts.support_hours}</span> : null}
              {socialLinks.length ? (
                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-1">
                  {socialLinks.map((link) => (
                    <a className="transition hover:text-white" href={link.href} key={link.label} rel="noreferrer" target="_blank">
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {footerSections.map((section) => (
            <FooterLinks key={section.title} section={section} />
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-[#b8aaa0]">
        В© {new Date().getFullYear()} AromaNavigator
      </div>
    </footer>
  );
}
