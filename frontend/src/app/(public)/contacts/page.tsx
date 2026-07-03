import FeedbackForm from '@/app/components/site/FeedbackForm';
import SiteTextPage from '@/app/components/site/SiteTextPage';
import {
  getPublicSiteContentServer,
  getSitePageServer,
} from '@/app/services/siteContentServices.server';

export const dynamic = 'force-dynamic';

function ContactCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const className =
    'grid gap-1 rounded-2xl border border-[#eadfd3] bg-white p-4 text-sm shadow-sm transition hover:border-[#d7c4b3]';
  const content = (
    <>
      <span className="font-semibold text-[#6f5b4f]">{label}</span>
      <span className="break-words text-base font-semibold text-[#2b211d]">{value}</span>
    </>
  );

  if (href) {
    return (
      <a className={className} href={href}>
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

export default async function ContactsPage() {
  const [page, content] = await Promise.all([
    getSitePageServer('contacts'),
    getPublicSiteContentServer(),
  ]);
  const contacts = content.contacts;
  const hasContactDetails = Boolean(
    contacts.contact_email ||
      contacts.contact_phone ||
      contacts.contact_address ||
      contacts.support_hours,
  );

  return (
    <SiteTextPage page={page}>
      {hasContactDetails ? (
        <section className="mb-8 grid gap-4 sm:grid-cols-2">
          {contacts.contact_email ? (
            <ContactCard
              href={`mailto:${contacts.contact_email}`}
              label="Email"
              value={contacts.contact_email}
            />
          ) : null}
          {contacts.contact_phone ? (
            <ContactCard
              href={`tel:${contacts.contact_phone.replace(/\s/g, '')}`}
              label="РўРµР»РµС„РѕРЅ"
              value={contacts.contact_phone}
            />
          ) : null}
          {contacts.contact_address ? (
            <ContactCard label="РђРґСЂРµСЃР° / РґРѕРґР°С‚РєРѕРІР° С–РЅС„РѕСЂРјР°С†С–СЏ" value={contacts.contact_address} />
          ) : null}
          {contacts.support_hours ? (
            <ContactCard label="Р“РѕРґРёРЅРё РїС–РґС‚СЂРёРјРєРё" value={contacts.support_hours} />
          ) : null}
        </section>
      ) : null}

      <h2 className="mb-4 font-serif text-2xl font-semibold">РќР°РїРёСЃР°С‚Рё РЅР°Рј</h2>
      <FeedbackForm />
    </SiteTextPage>
  );
}
