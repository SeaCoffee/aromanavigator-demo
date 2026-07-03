import type { ID, Query } from '@/app/types/http';
import { build, seg } from '@/app/utils/urlUtils';

export const fragrancePageUrlBuilder = {
  public: {
    list: (query?: Query) => build('/fragrances', query),
    detail: (slug: string) => build(`/fragrances/${seg(slug)}`),

    brands: (query?: Query) => build('/fragrances/brands', query),
    brandDetail: (slug: string) => build(`/fragrances/brands/${seg(slug)}`),

    notes: (query?: Query) => build('/fragrances/notes', query),
    noteDetail: (slug: string) => build(`/fragrances/notes/${seg(slug)}`),

    families: (query?: Query) => build('/fragrances/families', query),
    familyDetail: (slug: string) =>
      build(`/fragrances/families/${seg(slug)}`),

    perfumers: (query?: Query) => build('/fragrances/perfumers', query),
    perfumerDetail: (id: ID) => build(`/fragrances/perfumers/${seg(id)}`),
  },

  admin: {
    fragrances: (query?: Query) => build('/admin/fragrances', query),
    createFragrance: () => build('/admin/fragrances/create'),
    editFragrance: (id: ID) =>
      build(`/admin/fragrances/${seg(id)}/edit`),
  },
} as const;
