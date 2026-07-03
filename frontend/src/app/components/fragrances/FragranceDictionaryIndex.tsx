import Link from 'next/link';

import type { ID } from '@/app/types/http';

export type FragranceDictionaryIndexItem = {
  id: ID;
  name: string;
  slug?: string | null;
};

type FragranceDictionaryIndexProps<TItem extends FragranceDictionaryIndexItem> =
  {
    title: string;
    description: string;
    items: TItem[];
    emptyText: string;
    getHref: (item: TItem) => string;
  };

export default function FragranceDictionaryIndex<
  TItem extends FragranceDictionaryIndexItem,
>({
  title,
  description,
  items,
  emptyText,
  getHref,
}: FragranceDictionaryIndexProps<TItem>) {
  return (
    <section className="grid gap-6">
      <header className="grid gap-2">
        <h1 className="text-3xl font-semibold text-neutral-950">{title}</h1>

        <p className="max-w-3xl text-sm text-neutral-600">{description}</p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
          {emptyText}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <Link
              key={String(item.id)}
              href={getHref(item)}
              className="rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm"
            >
              <div className="font-medium text-neutral-950">{item.name}</div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
