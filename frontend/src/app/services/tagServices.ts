import { anonApi } from '@/app/services/userApi';
import type { Query } from '@/app/types/http';
import type { Paginated, Tag } from '@/app/types/forumTypes';
import { tagApiUrlBuilder } from '@/app/urls/tagUrlBuilder';

export function getTags(query?: Query) {
  return anonApi.get<Paginated<Tag>>(tagApiUrlBuilder.anon.list(query), {
    cache: 'no-store',
  });
}

export function getPopularTags(query?: Query) {
  return anonApi.get<Paginated<Tag>>(tagApiUrlBuilder.anon.popular(query), {
    cache: 'no-store',
  });
}
