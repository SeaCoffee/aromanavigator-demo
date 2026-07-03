import type { Query } from "@/app/types/http";
import { build, seg } from "@/app/utils/urlUtils";

export const adminPageUrlBuilder = {
  home: () => build("/admin"),

  settings: {
    siteContent: () => build("/admin/settings/site-content"),
  },

  feedback: {
    list: (query?: Query) => build("/admin/feedback", query),
    detail: (id: number | string) => build(`/admin/feedback/${seg(id)}`),
  },

  fragranceUgc: {
    addRequests: (query?: Query) =>
      build("/admin/fragrance-ugc/add-requests", query),
    addRequestDetail: (id: number | string) =>
      build(`/admin/fragrance-ugc/add-requests/${seg(id)}`),

    noteSuggestions: (query?: Query) =>
      build("/admin/fragrance-ugc/note-suggestions", query),

    similaritySuggestions: (query?: Query) =>
      build("/admin/fragrance-ugc/similarity-suggestions", query),
  },

  fragrances: {
    list: (query?: Query) => build("/admin/fragrances", query),
    create: (query?: Query) => build("/admin/fragrances/create", query),
    edit: (id: number | string) => build(`/admin/fragrances/${seg(id)}/edit`),
  },

  notifications: {
    announcements: (query?: Query) =>
      build("/admin/notifications/announcements", query),
  },

  forum: {
    list: (query?: Query) => build("/admin/forum", query),
  },

  comments: {
    list: (query?: Query) => build("/admin/comments", query),
  },

  photos: {
    list: (query?: Query) => build("/admin/photos", query),
  },

  articles: {
    moderation: (query?: Query) => build("/admin/articles/moderation", query),
  },

  users: {
    list: (query?: Query) => build("/admin/users", query),
    detail: (id: number | string) => build(`/admin/users/${seg(id)}`),
  },
} as const;
