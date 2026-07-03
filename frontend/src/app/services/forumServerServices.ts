import 'server-only';

import { djangoJson } from '@/app/services/djangoClient.server';
import { forumApiUrlBuilder } from '@/app/urls/forumUrlBuilder';
import type { Query } from '@/app/types/http';
import type {
  ForumSection,
  ForumSectionCreatePayload,
  ForumSectionUpdatePayload,
  ForumTopic,
  ForumTopicCreatePayload,
  ForumTopicListQuery,
  ForumTopicUpdatePayload,
  ID,
  Paginated,
} from '@/app/types/forumTypes';

export function getForumSectionsServer(query?: Query) {
  return djangoJson<Paginated<ForumSection> | ForumSection[]>(
    forumApiUrlBuilder.server.sections.list(query),
    {
      method: 'GET',
      auth: 'auto',
    },
  );
}

export function getForumSectionServer(sectionId: ID | string) {
  return djangoJson<ForumSection>(
    forumApiUrlBuilder.server.sections.detail(sectionId),
    {
      method: 'GET',
      auth: 'auto',
    },
  );
}

export function createForumSectionServer(payload: ForumSectionCreatePayload) {
  return djangoJson<ForumSection, ForumSectionCreatePayload>(
    forumApiUrlBuilder.server.sections.create(),
    {
      method: 'POST',
      auth: 'required',
      json: payload,
    },
  );
}

export function updateForumSectionServer(
  sectionId: ID | string,
  payload: ForumSectionUpdatePayload,
) {
  return djangoJson<ForumSection, ForumSectionUpdatePayload>(
    forumApiUrlBuilder.server.sections.update(sectionId),
    {
      method: 'PATCH',
      auth: 'required',
      json: payload,
    },
  );
}

export function deleteForumSectionServer(sectionId: ID | string) {
  return djangoJson<void>(
    forumApiUrlBuilder.server.sections.delete(sectionId),
    {
      method: 'DELETE',
      auth: 'required',
    },
  );
}

export function getForumTopicsServer(query?: ForumTopicListQuery) {
  return djangoJson<Paginated<ForumTopic> | ForumTopic[]>(
    forumApiUrlBuilder.server.topics.list(query),
    {
      method: 'GET',
      auth: 'auto',
    },
  );
}

export function getForumTopicServer(topicId: ID | string) {
  return djangoJson<ForumTopic>(
    forumApiUrlBuilder.server.topics.detail(topicId),
    {
      method: 'GET',
      auth: 'auto',
    },
  );
}

export function createForumTopicServer(payload: ForumTopicCreatePayload) {
  return djangoJson<ForumTopic, ForumTopicCreatePayload>(
    forumApiUrlBuilder.server.topics.create(),
    {
      method: 'POST',
      auth: 'required',
      json: payload,
    },
  );
}

export function updateForumTopicServer(
  topicId: ID | string,
  payload: ForumTopicUpdatePayload,
) {
  return djangoJson<ForumTopic, ForumTopicUpdatePayload>(
    forumApiUrlBuilder.server.topics.update(topicId),
    {
      method: 'PATCH',
      auth: 'required',
      json: payload,
    },
  );
}

export function deleteForumTopicServer(topicId: ID | string) {
  return djangoJson<void>(
    forumApiUrlBuilder.server.topics.delete(topicId),
    {
      method: 'DELETE',
      auth: 'required',
    },
  );
}
