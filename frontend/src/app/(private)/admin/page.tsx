import { fragranceAdminLabels as labels } from '@/app/components/fragrances/fragranceAdminLabels';

export default async function AdminHomePage() {
  return (
    <main className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{labels.adminPanel}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {labels.adminHomeDescription}
        </p>
      </div>
    </main>
  );
}
