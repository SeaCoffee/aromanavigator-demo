import AdminForumSections from '@/app/components/admin/AdminForumSections';
import AdminForumTopicsTable from '@/app/components/admin/AdminForumTopicsTable';
import { moderationAdminStyles as s } from '@/app/components/admin/moderationAdminStyles';
import { getForumSectionsServer, getForumTopicsServer } from '@/app/services/forumServerServices';
import type { ForumSection, ForumTopic } from '@/app/types/forumTypes';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';
import SimplePagination from '@/app/utils/SimplePagination';
import { paginatedResults, paginatedTotal } from '@/app/utils/valueUtils';

const PAGE_SIZE = 30;

export default async function AdminForumPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const page = Math.max(1, Number(typeof params.page === 'string' ? params.page : 1) || 1);
  const [sectionsResponse, topicsResponse] = await Promise.all([
    getForumSectionsServer({ page_size: 200, ordering: 'order,title' }),
    getForumTopicsServer({ page, page_size: PAGE_SIZE, ordering: '-created_at' }),
  ]);
  const sections = paginatedResults<ForumSection>(sectionsResponse);
  const topics = paginatedResults<ForumTopic>(topicsResponse);

  return (
    <main className={s.page}>
      <header className={s.header}>
        <h1 className={s.title}>РњРѕРґРµСЂР°С†С–СЏ С„РѕСЂСѓРјСѓ</h1>
        <p className={s.subtitle}>Р РѕР·РґС–Р»Рё С„РѕСЂСѓРјСѓ С‚Р° РѕСЃС‚Р°РЅРЅС– С‚РµРјРё Р· С€РІРёРґРєРёРјРё РґС–СЏРјРё.</p>
      </header>
      <AdminForumSections sections={sections} />
      <AdminForumTopicsTable topics={topics} />
      <SimplePagination page={page} pageSize={PAGE_SIZE} totalItems={paginatedTotal(topicsResponse)} hrefForPage={(nextPage) => adminPageUrlBuilder.forum.list({ page: nextPage })} />
    </main>
  );
}
