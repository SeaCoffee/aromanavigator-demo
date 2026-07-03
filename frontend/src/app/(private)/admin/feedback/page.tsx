import Link from 'next/link';

import { getAdminFeedbackServer } from '@/app/services/siteContentServices.server';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';
import SimplePagination from '@/app/utils/SimplePagination';
import { paginatedTotal } from '@/app/utils/valueUtils';

type Props = { searchParams: Promise<{ page?: string; status?: string; search?: string }> };

export default async function AdminFeedbackPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1) || 1);
  const response = await getAdminFeedbackServer({
    page,
    page_size: 20,
    status: params.status,
    search: params.search,
  });

  return (
    <main className="grid gap-6">
      <header>
        <h1 className="text-2xl font-semibold">Р—РІРѕСЂРѕС‚РЅРёР№ Р·РІвЂ™СЏР·РѕРє</h1>
        <p className="mt-1 text-sm text-gray-500">РџРѕРІС–РґРѕРјР»РµРЅРЅСЏ, РЅР°РґС–СЃР»Р°РЅС– С‡РµСЂРµР· С„РѕСЂРјСѓ РєРѕРЅС‚Р°РєС‚С–РІ.</p>
      </header>
      <form className="flex flex-wrap gap-3">
        <input className="min-w-64 rounded-xl border border-[#cdd8dc] px-3 py-2" defaultValue={params.search} name="search" placeholder="РџРѕС€СѓРє" />
        <select className="rounded-xl border border-[#cdd8dc] px-3 py-2" defaultValue={params.status || ''} name="status">
          <option value="">РЈСЃС– СЃС‚Р°С‚СѓСЃРё</option>
          <option value="new">РќРѕРІС–</option>
          <option value="in_progress">Р’ СЂРѕР±РѕС‚С–</option>
          <option value="resolved">Р’РёСЂС–С€РµРЅС–</option>
          <option value="spam">РЎРїР°Рј</option>
        </select>
        <button className="rounded-xl bg-[#344a52] px-4 py-2 text-white">Р—Р°СЃС‚РѕСЃСѓРІР°С‚Рё</button>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-[#dfe6e8] bg-white">
        <table className="min-w-full text-sm">
          <thead><tr className="border-b text-left"><th className="p-3">Р”Р°С‚Р°</th><th className="p-3">Р’С–РґРїСЂР°РІРЅРёРє</th><th className="p-3">РўРµРјР°</th><th className="p-3">РЎС‚Р°С‚СѓСЃ</th></tr></thead>
          <tbody>
            {response.results.map((item) => (
              <tr className="border-b last:border-0" key={item.id}>
                <td className="p-3">{new Date(item.created_at).toLocaleString('uk-UA')}</td>
                <td className="p-3"><div>{item.name}</div><div className="text-gray-500">{item.email}</div></td>
                <td className="p-3"><Link className="font-semibold text-[#385b68]" href={adminPageUrlBuilder.feedback.detail(item.id)}>{item.subject}</Link></td>
                <td className="p-3">{item.status_label}</td>
              </tr>
            ))}
            {!response.results.length ? <tr><td className="p-5 text-gray-500" colSpan={4}>Р—РІРµСЂРЅРµРЅСЊ РЅРµ Р·РЅР°Р№РґРµРЅРѕ.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <SimplePagination
        hrefForPage={(nextPage) => adminPageUrlBuilder.feedback.list({ ...params, page: nextPage })}
        page={page}
        pageSize={20}
        totalItems={paginatedTotal(response)}
      />
    </main>
  );
}
