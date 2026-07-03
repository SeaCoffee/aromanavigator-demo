import {
  LIKE_CONTENT_TYPES,
  type LikeTarget,
  type LikeTargetPayload,
} from '@/app/types/likeTypes';

export function forumTopicLikeTarget(topicId: number): LikeTarget {
  return {
    content_type: LIKE_CONTENT_TYPES.forumTopic,
    object_id: topicId,
  };
}

export function commentLikeTarget(commentId: number): LikeTarget {
  return {
    content_type: LIKE_CONTENT_TYPES.comment,
    object_id: commentId,
  };
}

export function likeTargetPayload(target: LikeTarget): LikeTargetPayload {
  return {
    target,
  };
}
