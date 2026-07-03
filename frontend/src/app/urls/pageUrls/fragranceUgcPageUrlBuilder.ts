import type { ID, Query } from '@/app/types/http';
import { build, seg } from '@/app/utils/urlUtils';

export const fragranceUgcPageUrlBuilder = {
  me: {
    addRequests: (query?: Query) =>
      build('/me/fragrance/add-requests', query),
    createAddRequest: () => build('/me/fragrance/add-requests/create'),
  },

  admin: {
    noteSuggestions: (query?: Query) =>
      build('/admin/fragrance-ugc/note-suggestions', query),

    similaritySuggestions: (query?: Query) =>
      build('/admin/fragrance-ugc/similarity-suggestions', query),

    addRequests: (query?: Query) =>
      build('/admin/fragrance-ugc/add-requests', query),

    addRequestDetail: (id: ID) =>
      build(`/admin/fragrance-ugc/add-requests/${seg(id)}`),
  },
} as const;
