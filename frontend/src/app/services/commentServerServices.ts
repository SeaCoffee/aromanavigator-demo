import 'server-only';

import { djangoFormData, djangoJson } from '@/app/services/djangoClient.server';
import { commentApiUrlBuilder } from '@/app/urls/commentUrlBuilder';
import type { Query } from '@/app/types/http';
import type {
  ForumComment,
  ForumCommentCreatePayload,
  ForumCommentTargetQuery,
  ForumCommentThreadItem,
  ForumCommentUpdatePayload,
  ID,
  Paginated,
} from '@/app/types/forumTypes';

export function getCommentsByTargetServer(query: ForumCommentTargetQuery) {
  return djangoJson<Paginated<ForumComment> | ForumComment[]>(
    commentApiUrlBuilder.server.list(query),
    {
      method: 'GET',
      auth: 'auto',
    },
  );
}

export function getCommentThreadByTargetServer(query: ForumCommentTargetQuery) {
  return djangoJson<Paginated<ForumCommentThreadItem> | ForumCommentThreadItem[]>(
    commentApiUrlBuilder.server.thread(query),
    {
      method: 'GET',
      auth: 'auto',
    },
  );
}

export function getModerationCommentsServer(query?: Query) {
  return djangoJson<Paginated<ForumComment> | ForumComment[]>(
    commentApiUrlBuilder.server.modList(query),
    {
      method: 'GET',
      auth: 'required',
    },
  );
}

export function createCommentServer(payload: ForumCommentCreatePayload) {
  return djangoJson<ForumComment, ForumCommentCreatePayload>(
    commentApiUrlBuilder.server.create(),
    {
      method: 'POST',
      auth: 'required',
      json: payload,
    },
  );
}

export function updateCommentServer(
  commentId: ID | string,
  payload: ForumCommentUpdatePayload,
) {
  return djangoJson<ForumComment, ForumCommentUpdatePayload>(
    commentApiUrlBuilder.server.update(commentId),
    {
      method: 'PATCH',
      auth: 'required',
      json: payload,
    },
  );
}

export function deleteCommentServer(commentId: ID | string) {
  return djangoJson<void>(
    commentApiUrlBuilder.server.delete(commentId),
    {
      method: 'DELETE',
      auth: 'required',
    },
  );
}

export function createCommentFormServer(formData: FormData) {
  return djangoFormData<ForumComment>(
    commentApiUrlBuilder.server.create(),
    {
      method: 'POST',
      auth: 'required',
      formData,
    },
  );
}
