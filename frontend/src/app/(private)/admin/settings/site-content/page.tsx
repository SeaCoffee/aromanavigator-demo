import AdminSiteContentForms from '@/app/components/admin/AdminSiteContentForms';
import {
  getAdminFaqServer,
  getAdminSiteContentServer,
  getAdminSitePagesServer,
} from '@/app/services/siteContentServices.server';

export default async function AdminSiteContentPage() {
  const [settings, pages, faq] = await Promise.all([
    getAdminSiteContentServer(),
    getAdminSitePagesServer(),
    getAdminFaqServer(),
  ]);

  return (
    <main className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold">РљРѕРЅС‚РµРЅС‚ СЃР°Р№С‚Сѓ</h1>
        <p className="mt-1 text-sm text-gray-500">
          Р¤СѓС‚РµСЂ, РєРѕРЅС‚Р°РєС‚Рё, С–РЅС„РѕСЂРјР°С†С–Р№РЅС– СЃС‚РѕСЂС–РЅРєРё С‚Р° С‡Р°СЃС‚С– РїРёС‚Р°РЅРЅСЏ.
        </p>
      </header>
      <AdminSiteContentForms faq={faq} pages={pages} settings={settings} />
    </main>
  );
}
