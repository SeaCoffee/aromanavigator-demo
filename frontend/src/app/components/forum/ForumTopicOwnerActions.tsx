'use client';

import Link from 'next/link';

import ForumTopicDeleteButton from '@/app/components/forum/ForumTopicDeleteButton';
import { forumTopicStyles } from '@/app/components/forum/forumStyles';
import { forumPageUrlBuilder } from '@/app/urls/pageUrls/forumPageUrlBuilder';

type Props = {
  topicId: number;
  sectionId?: number | string | null;
  refreshPaths?: string[];
};

export default function ForumTopicOwnerActions({
  topicId,
  sectionId = null,
  refreshPaths,
}: Props) {
  return (
    <div className={forumTopicStyles.ownerActions}>
      <Link
        href={forumPageUrlBuilder.topics.edit(topicId)}
        className={forumTopicStyles.ownerEditButton}
      >
        Р РµРґР°РіСѓРІР°С‚Рё
      </Link>

      <ForumTopicDeleteButton
        topicId={topicId}
        sectionId={sectionId}
        refreshPaths={refreshPaths}
      />
    </div>
  );
}
