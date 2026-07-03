import { notFound } from 'next/navigation';

import DeleteFragranceButton from '@/app/components/fragrances/DeleteFragranceButton';
import FragranceEditForm from '@/app/components/fragrances/FragranceEditForm';
import FragrancePhotosManager from '@/app/components/fragrances/FragrancePhotosManager';
import FragranceRelationsEditor from '@/app/components/fragrances/FragranceRelationsEditor';
import { fragranceAdminLabels as labels } from '@/app/components/fragrances/fragranceAdminLabels';
import { fragranceAdminStyles as styles } from '@/app/components/fragrances/fragranceAdmin.styles';
import {
  getBrandsServer,
  getFamiliesServer,
  getFragranceServer,
  getNotesServer,
  getPerfumersServer,
} from '@/app/services/fragranceServices.server';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditFragrancePage({ params }: PageProps) {
  const { id } = await params;

  if (!Number.isFinite(Number(id))) {
    notFound();
  }

  const [fragrance, brands, perfumers, families, notes] = await Promise.all([
    getFragranceServer(id).catch(() => null),
    getBrandsServer({ ordering: 'name', page_size: 1000 }),
    getPerfumersServer({ ordering: 'name', page_size: 1000 }),
    getFamiliesServer({ ordering: 'name', page_size: 1000 }),
    getNotesServer({ ordering: 'name', page_size: 1000 }),
  ]);

  if (!fragrance) {
    notFound();
  }

  return (
    <main className={styles.editPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>{labels.editFragranceTitle}</h1>
        <p className={styles.subtitle}>
          {fragrance.brand.name} - {fragrance.name}
        </p>
      </header>

      <section className="grid gap-3">
        <h2 className="text-xl font-semibold text-neutral-950">
          {labels.mainData}
        </h2>
        <FragranceEditForm fragrance={fragrance} brands={brands.results} />
      </section>

      <FragranceRelationsEditor
        fragrance={fragrance}
        allPerfumers={perfumers.results}
        allFamilies={families.results}
        allNotes={notes.results}
      />

      <FragrancePhotosManager fragrance={fragrance} />

      <DeleteFragranceButton fragranceId={fragrance.id} />
    </main>
  );
}
