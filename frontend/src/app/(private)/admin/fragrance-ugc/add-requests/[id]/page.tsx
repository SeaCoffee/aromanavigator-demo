import { notFound } from 'next/navigation';

import AddRequestEditForm from '@/app/components/fragrances/ugc/AddRequestEditForm';
import { fragranceAdminStyles as styles } from '@/app/components/fragrances/fragranceAdmin.styles';
import {
  getBrandsServer,
  getFamiliesServer,
  getFragrancesServer,
  getNotesServer,
  getPerfumersServer,
} from '@/app/services/fragranceServices.server';
import {
  getAdminFragranceAddRequestServer,
} from '@/app/services/fragranceUgcService.server';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminAddRequestEditPage({ params }: PageProps) {
  const { id } = await params;

  if (!Number.isFinite(Number(id)) || Number(id) <= 0) {
    notFound();
  }

  const [request, brands, fragrances, perfumers, families, notes] =
    await Promise.all([
      getAdminFragranceAddRequestServer(id).catch(() => null),
      getBrandsServer({ ordering: 'name', page_size: 1000 }),
      getFragrancesServer({ ordering: 'brand', page_size: 1000 }),
      getPerfumersServer({ ordering: 'name', page_size: 1000 }),
      getFamiliesServer({ ordering: 'name', page_size: 1000 }),
      getNotesServer({ ordering: 'name', page_size: 1000 }),
    ]);

  if (!request) {
    notFound();
  }

  return (
    <main className={styles.editPage}>
      <AddRequestEditForm
        item={request}
        brands={brands.results}
        fragrances={fragrances.results}
        perfumers={perfumers.results}
        families={families.results}
        notes={notes.results}
      />
    </main>
  );
}
