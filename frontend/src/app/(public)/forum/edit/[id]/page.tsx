import Link from 'next/link';
import { notFound } from 'next/navigation';

import ForumTopicEditForm from '@/app/components/forum/ForumTopicEditForm';
import { getForumTopicServer } from '@/app/services/forumServerServices';
import type { ForumTopic } from '@/app/types/forumTypes';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';

export default async function ForumTopicEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const topicId = Number(id);

  if (!Number.isFinite(topicId) || topicId <= 0) {
    notFound();
  }

  let topic: ForumTopic;

  try {
    topic = await getForumTopicServer(topicId);
  } catch {
    notFound();
  }

  if (!topic.is_owner) {
    notFound();
  }

  const topicPath = forumPageUrlBuilder.topics.detail(topic.id);
  const sectionPath = forumPageUrlBuilder.sections.detail(topic.section);

  return (
    <main className="container mx-auto px-4 py-6">
      <nav className="mb-4 flex flex-wrap gap-2 text-sm text-gray-500">
        <Link href={topicPath} className="hover:underline">
          Р”Рѕ С‚РµРјРё
        </Link>
        <span>/</span>
        <Link href={sectionPath} className="hover:underline">
          Р”Рѕ СЂРѕР·РґС–Р»Сѓ
        </Link>
      </nav>

      <ForumTopicEditForm
        topic={topic}
        refreshPaths={[topicPath, sectionPath]}
      />
    </main>
  );
}
