import { ObjectPhotoManager } from '@/app/components/photos/ObjectPhotoManager';
import type { ID } from '@/app/types/http';
import type { ObjectPhotosInitial } from '@/app/types/photoTypes';
import { forumTopicPhotoTarget } from '@/app/utils/photoTargetBuilders';

type ForumTopicPhotoSectionProps = {
  topicId: ID;
  photos?: ObjectPhotosInitial;
  refreshPaths?: string[];
};

export function ForumTopicPhotoSection({
  topicId,
  photos,
  refreshPaths = [],
}: ForumTopicPhotoSectionProps) {
  return (
    <ObjectPhotoManager
      target={forumTopicPhotoTarget(topicId)}
      initialPhotos={photos}
      withCover
      withAttachments
      refresh={{
        paths: refreshPaths,
      }}
      title="Р¤РѕС‚Рѕ С‚РµРјРё"
    />
  );
}
