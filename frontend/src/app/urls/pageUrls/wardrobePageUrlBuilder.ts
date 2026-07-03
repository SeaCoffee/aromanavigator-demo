import type { Query } from '@/app/types/http';
import type { ID } from '@/app/types/http';
import type { WardrobeListQuery } from '@/app/types/wardrobeTypes';
import { build, seg } from '@/app/utils/urlUtils';

const page = (path: string, query?: WardrobeListQuery) => {
  return build(path, query as Query | undefined);
};

export const wardrobePageUrlBuilder = {
  me: {
    list: (query?: WardrobeListQuery) => page('/me/wardrobe', query),
    create: () => page('/me/wardrobe/create'),
    edit: (itemId: ID) => page(`/me/wardrobe/${seg(itemId)}/edit`),
  },

  public: {
    byDisplayName: (displayName: string, query?: WardrobeListQuery) => {
      return page(`/u/${seg(displayName)}/wardrobe`, query);
    },
  },
} as const;
