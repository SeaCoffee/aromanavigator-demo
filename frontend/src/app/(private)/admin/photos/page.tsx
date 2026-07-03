import AdminPhotosTable from '@/app/components/admin/AdminPhotosTable';
import { moderationAdminStyles as s } from '@/app/components/admin/moderationAdminStyles';
import {
  getModerationObjectCoversServer,
  getModerationObjectPhotosServer,
} from '@/app/services/objectPhotoServices.server';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';
import SimplePagination from '@/app/utils/SimplePagination';
import { paginatedTotal } from '@/app/utils/valueUtils';

const PAGE_SIZE = 30;

export default async function AdminPhotosPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const coverPage = Math.max(1, Number(typeof params.cover_page === 'string' ? params.cover_page : 1) || 1);
  const photoPage = Math.max(1, Number(typeof params.photo_page === 'string' ? params.photo_page : 1) || 1);
  const [covers, attachments] = await Promise.all([
    getModerationObjectCoversServer({ page: coverPage, page_size: PAGE_SIZE }),
    getModerationObjectPhotosServer({ page: photoPage, page_size: PAGE_SIZE }),
  ]);

  return (
    <main className={s.page}>
      <header className={s.header}>
        <h1 className={s.title}>РњРѕРґРµСЂР°С†С–СЏ С„РѕС‚Рѕ</h1>
        <p className={s.subtitle}>РћР±РєР»Р°РґРёРЅРєРё С‚Р° РІРєР»Р°РґРµРЅРЅСЏ, РґРѕРґР°РЅС– РєРѕСЂРёСЃС‚СѓРІР°С‡Р°РјРё РґРѕ РѕР±КјС”РєС‚С–РІ.</p>
      </header>
      <AdminPhotosTable title="РћР±РєР»Р°РґРёРЅРєРё" photos={covers.results} />
      <SimplePagination page={coverPage} pageSize={PAGE_SIZE} totalItems={paginatedTotal(covers)} hrefForPage={(page) => adminPageUrlBuilder.photos.list({ ...params, cover_page: page })} />
      <AdminPhotosTable title="Р’РєР»Р°РґРµРЅРЅСЏ" photos={attachments.results} />
      <SimplePagination page={photoPage} pageSize={PAGE_SIZE} totalItems={paginatedTotal(attachments)} hrefForPage={(page) => adminPageUrlBuilder.photos.list({ ...params, photo_page: page })} />
    </main>
  );
}
