import type { ID } from '@/app/types/http';
import type { PhotoTarget } from '@/app/types/photoTypes';

export function profilePhotoTarget(profileId: ID): PhotoTarget {
  return {
    app: 'users',
    model: 'profilemodel',
    id: profileId,
  };
}

export function articlePhotoTarget(articleId: ID): PhotoTarget {
  return {
    app: 'articles',
    model: 'article',
    id: articleId,
  };
}

export function articlePhotoTargetString(articleId: ID) {
  return `articles.article:${articleId}`;
}

export function fragrancePhotoTarget(fragranceId: ID): PhotoTarget {
  return {
    app: 'fragrance',
    model: 'fragrancemodel',
    id: fragranceId,
  };
}

export function forumTopicPhotoTarget(topicId: ID): PhotoTarget {
  return {
    app: 'forum',
    model: 'forumtopicmodel',
    id: topicId,
  };
}

export function forumTopicPhotoTargetString(topicId: ID) {
  return `forum.forumtopicmodel:${topicId}`;
}
