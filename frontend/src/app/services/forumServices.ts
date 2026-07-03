import { anonApi, userApi } from '@/app/services/userApi';
import { forumApiUrlBuilder } from '@/app/urls/forumUrlBuilder';
import { paginatedResults } from '@/app/utils/valueUtils';
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

export function getForumSections(params: Query = {}) {
  return anonApi.get<Paginated<ForumSection> | ForumSection[]>(
    forumApiUrlBuilder.anon.sections.list(params),
    {
      cache: 'no-store',
    },
  );
}

export function getForumSection(sectionId: ID | string) {
  return anonApi.get<ForumSection>(
    forumApiUrlBuilder.anon.sections.detail(sectionId),
    {
      cache: 'no-store',
    },
  );
}

export function createForumSection(payload: ForumSectionCreatePayload) {
  return userApi.post<ForumSection>(
    forumApiUrlBuilder.user.sections.create(),
    {
      json: payload,
      cache: 'no-store',
    },
  );
}

export function updateForumSection(
  sectionId: ID | string,
  payload: ForumSectionUpdatePayload,
) {
  return userApi.patch<ForumSection>(
    forumApiUrlBuilder.user.sections.update(sectionId),
    {
      json: payload,
      cache: 'no-store',
    },
  );
}

export function deleteForumSection(sectionId: ID | string) {
  return userApi.delete<void>(
    forumApiUrlBuilder.user.sections.delete(sectionId),
    {
      cache: 'no-store',
    },
  );
}

export function getForumTopics(params: ForumTopicListQuery = {}) {
  return anonApi.get<Paginated<ForumTopic> | ForumTopic[]>(
    forumApiUrlBuilder.anon.topics.list(params),
    {
      cache: 'no-store',
    },
  );
}

export function getForumTopicsAuth(params: ForumTopicListQuery = {}) {
  return userApi.get<Paginated<ForumTopic> | ForumTopic[]>(
    forumApiUrlBuilder.user.topics.list(params),
    {
      cache: 'no-store',
    },
  );
}

export function getForumTopic(topicId: ID | string) {
  return anonApi.get<ForumTopic>(
    forumApiUrlBuilder.anon.topics.detail(topicId),
    {
      cache: 'no-store',
    },
  );
}

export function getForumTopicAuth(topicId: ID | string) {
  return userApi.get<ForumTopic>(
    forumApiUrlBuilder.user.topics.detail(topicId),
    {
      cache: 'no-store',
    },
  );
}

export function createForumTopic(payload: ForumTopicCreatePayload) {
  return userApi.post<ForumTopic>(
    forumApiUrlBuilder.user.topics.create(),
    {
      json: payload,
      cache: 'no-store',
    },
  );
}

export function updateForumTopic(
  topicId: ID | string,
  payload: ForumTopicUpdatePayload,
) {
  return userApi.patch<ForumTopic>(
    forumApiUrlBuilder.user.topics.update(topicId),
    {
      json: payload,
      cache: 'no-store',
    },
  );
}

export function deleteForumTopic(topicId: ID | string) {
  return userApi.delete<void>(
    forumApiUrlBuilder.user.topics.delete(topicId),
    {
      cache: 'no-store',
    },
  );
}

export function asForumArray<T>(data: Paginated<T> | T[]): T[] {
  return paginatedResults(data);
}
