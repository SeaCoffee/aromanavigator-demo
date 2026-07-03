import 'server-only';

import { djangoJson } from '@/app/services/djangoClient.server';
import type { Query } from '@/app/types/http';
import type { Paginated, Tag } from '@/app/types/forumTypes';
import { tagApiUrlBuilder } from '@/app/urls/tagUrlBuilder';

export function getTagsServer(query?: Query) {
  return djangoJson<Paginated<Tag>>(tagApiUrlBuilder.server.list(query), {
    method: 'GET',
    auth: 'auto',
  });
}

export function getPopularTagsServer(query?: Query) {
  return djangoJson<Paginated<Tag>>(tagApiUrlBuilder.server.popular(query), {
    method: 'GET',
    auth: 'auto',
  });
}
