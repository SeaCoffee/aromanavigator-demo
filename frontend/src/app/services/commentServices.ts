import { anonApi, userApi } from '@/app/services/userApi';
import { commentApiUrlBuilder } from '@/app/urls/commentUrlBuilder';
import type {
  ForumComment,
  ForumCommentCreatePayload,
  ForumCommentTargetQuery,
  ForumCommentThreadItem,
  ID,
  Paginated,
} from '@/app/types/forumTypes';

export function getCommentsByTarget(params: ForumCommentTargetQuery) {
  return anonApi.get<Paginated<ForumComment> | ForumComment[]>(
    commentApiUrlBuilder.anon.list(params),
    {
      cache: 'no-store',
    },
  );
}

export function getCommentsByTargetAuth(params: ForumCommentTargetQuery) {
  return userApi.get<Paginated<ForumComment> | ForumComment[]>(
    commentApiUrlBuilder.user.list(params),
    {
      cache: 'no-store',
    },
  );
}

export function getCommentThreadByTarget(params: ForumCommentTargetQuery) {
  return anonApi.get<Paginated<ForumCommentThreadItem> | ForumCommentThreadItem[]>(
    commentApiUrlBuilder.anon.thread(params),
    {
      cache: 'no-store',
    },
  );
}

export function getCommentThreadByTargetAuth(params: ForumCommentTargetQuery) {
  return userApi.get<Paginated<ForumCommentThreadItem> | ForumCommentThreadItem[]>(
    commentApiUrlBuilder.user.thread(params),
    {
      cache: 'no-store',
    },
  );
}

export function createComment(payload: ForumCommentCreatePayload) {
  return userApi.post<ForumComment>(
    commentApiUrlBuilder.user.create(),
    {
      json: payload,
      cache: 'no-store',
    },
  );
}

export function deleteComment(commentId: ID | string) {
  return userApi.delete<void>(
    commentApiUrlBuilder.user.delete(commentId),
    {
      cache: 'no-store',
    },
  );
}

export function forumTopicTargetQuery(
  topicId: number | string,
  patch?: Partial<ForumCommentTargetQuery>,
): ForumCommentTargetQuery {
  return {
    app: 'forum',
    model: 'forumtopicmodel',
    id: topicId,
    ...(patch ?? {}),
  };
}
