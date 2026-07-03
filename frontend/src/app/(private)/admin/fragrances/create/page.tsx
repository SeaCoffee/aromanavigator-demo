import FragranceCreateForm from '@/app/components/fragrances/FragranceCreateForm';
import { fragranceAdminLabels as labels } from '@/app/components/fragrances/fragranceAdminLabels';
import { fragranceAdminStyles as styles } from '@/app/components/fragrances/fragranceAdmin.styles';
import { getBrandsServer } from '@/app/services/fragranceServices.server';

type PageProps = {
  searchParams: Promise<{
    brand_name?: string;
    fragrance_name?: string;
    release_year?: string;
  }>;
};

export default async function AdminCreateFragrancePage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const brands = await getBrandsServer({
    page_size: 1000,
    ordering: 'name',
  });

  return (
    <main className={styles.narrowPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>{labels.createFragranceTitle}</h1>
        <p className={styles.subtitle}>{labels.createFragranceSubtitle}</p>
      </header>

      <FragranceCreateForm
        brands={brands.results}
        initialData={{
          brand_name: params.brand_name ?? '',
          fragrance_name: params.fragrance_name ?? '',
          release_year: params.release_year ?? '',
        }}
      />
    </main>
  );
}
