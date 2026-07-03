import type { ForumTopic } from '@/app/types/forumTypes';
import type { ObjectPhotosInitial } from '@/app/types/photoTypes';

export function forumTopicPhotosInitial(topic: ForumTopic): ObjectPhotosInitial {
  return {
    cover: topic.cover
      ? {
          id: topic.cover.id,
          image: topic.cover.image,
          created_at: topic.cover.created_at ?? '',
          updated_at: topic.cover.updated_at ?? '',
        }
      : null,

    attachments: (topic.attachments ?? []).map((photo, index) => ({
      id: photo.id,
      image: photo.image,
      position: Number.isFinite(Number(photo.position))
        ? Number(photo.position)
        : index + 1,
      created_at: photo.created_at,
      updated_at: photo.updated_at,
    })),
  };
}
