import AdminCommentsTable from '@/app/components/admin/AdminCommentsTable';
import { moderationAdminStyles as s } from '@/app/components/admin/moderationAdminStyles';
import { getModerationCommentsServer } from '@/app/services/commentServerServices';
import type { ForumComment } from '@/app/types/forumTypes';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';
import SimplePagination from '@/app/utils/SimplePagination';
import { paginatedResults, paginatedTotal } from '@/app/utils/valueUtils';

const PAGE_SIZE = 30;

export default async function AdminCommentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const page = Math.max(1, Number(typeof params.page === 'string' ? params.page : 1) || 1);
  const response = await getModerationCommentsServer({ page, page_size: PAGE_SIZE });
  const comments = paginatedResults<ForumComment>(response);

  return (
    <main className={s.page}>
      <header className={s.header}>
        <h1 className={s.title}>РњРѕРґРµСЂР°С†С–СЏ РєРѕРјРµРЅС‚Р°СЂС–РІ</h1>
        <p className={s.subtitle}>РќРѕРІС– РєРѕРјРµРЅС‚Р°СЂС–, РѕР±КјС”РєС‚Рё РѕР±РіРѕРІРѕСЂРµРЅРЅСЏ С‚Р° РІРєР»Р°РґРµРЅС– С„РѕС‚Рѕ.</p>
      </header>

      <AdminCommentsTable comments={comments} />
      <SimplePagination
        page={page}
        pageSize={PAGE_SIZE}
        totalItems={paginatedTotal(response)}
        hrefForPage={(nextPage) => adminPageUrlBuilder.comments.list({ page: nextPage })}
      />
    </main>
  );
}
