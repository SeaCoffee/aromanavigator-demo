import Link from 'next/link';

import ForumTopicCreateForm from '@/app/components/forum/ForumTopicCreateForm';
import { requireUserOrRedirect } from '@/app/lib/session';
import { getForumSectionsServer } from '@/app/services/forumServerServices';
import type { ForumSection, Paginated } from '@/app/types/forumTypes';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';
import { paginatedResults } from '@/app/utils/valueUtils';

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ForumTopicCreatePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireUserOrRedirect();

  const sp = await searchParams;
  const initialSectionId =
    typeof sp.section === 'string' ? Number(sp.section) : null;

  const sectionsData = await getForumSectionsServer({
    ordering: 'order,title',
    page_size: 100,
  }).catch(() => []);

  const sections = paginatedResults<ForumSection>(
    sectionsData as Paginated<ForumSection> | ForumSection[],
  ).filter((section) => section.is_active);

  return (
    <main className="container mx-auto px-4 py-6">
      <nav className="mb-4 text-sm text-gray-500">
        <Link href={forumPageUrlBuilder.home()} className="hover:underline">
          Р”Рѕ С„РѕСЂСѓРјСѓ
        </Link>
      </nav>

      <ForumTopicCreateForm
        sections={sections}
        initialSectionId={
          initialSectionId && Number.isFinite(initialSectionId)
            ? initialSectionId
            : null
        }
        refreshPaths={[forumPageUrlBuilder.home()]}
      />
    </main>
  );
}
