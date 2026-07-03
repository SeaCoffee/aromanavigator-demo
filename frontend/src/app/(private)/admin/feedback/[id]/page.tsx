import AdminFeedbackUpdateForm from '@/app/components/admin/AdminFeedbackUpdateForm';
import { getAdminFeedbackDetailServer } from '@/app/services/siteContentServices.server';

export default async function AdminFeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getAdminFeedbackDetailServer(id);

  return (
    <main className="grid gap-6">
      <header>
        <p className="text-sm text-gray-500">Р—РІРµСЂРЅРµРЅРЅСЏ #{item.id}</p>
        <h1 className="text-2xl font-semibold">{item.subject}</h1>
      </header>
      <section className="grid gap-4 rounded-2xl border border-[#dfe6e8] bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><span className="text-sm text-gray-500">Р†РјвЂ™СЏ</span><p>{item.name}</p></div>
          <div><span className="text-sm text-gray-500">Email</span><p><a href={`mailto:${item.email}`}>{item.email}</a></p></div>
          <div><span className="text-sm text-gray-500">Р”Р°С‚Р°</span><p>{new Date(item.created_at).toLocaleString('uk-UA')}</p></div>
          <div><span className="text-sm text-gray-500">РЎС‚РѕСЂС–РЅРєР°</span><p>{item.source_path || 'вЂ”'}</p></div>
        </div>
        <div><span className="text-sm text-gray-500">РџРѕРІС–РґРѕРјР»РµРЅРЅСЏ</span><p className="mt-1 whitespace-pre-line leading-7">{item.message}</p></div>
      </section>
      <AdminFeedbackUpdateForm item={item} />
    </main>
  );
}
