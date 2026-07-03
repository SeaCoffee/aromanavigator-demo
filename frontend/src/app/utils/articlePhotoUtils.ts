import type { ArticleDetail } from '@/app/types/articleTypes';
import type { ObjectPhotosInitial } from '@/app/types/photoTypes';

export function articlePhotosInitial(
  article: ArticleDetail,
): ObjectPhotosInitial {
  return {
    cover: article.cover
      ? {
          id: article.cover.id,
          image: article.cover.image,
          created_at: article.cover.created_at ?? '',
          updated_at: article.cover.updated_at ?? '',
        }
      : null,

    attachments: (article.attachments ?? []).map((photo, index) => ({
      id: photo.id,
      image: photo.image,
      position: photo.position ?? index + 1,
      created_at: photo.created_at,
      updated_at: photo.updated_at,
    })),
  };
}
