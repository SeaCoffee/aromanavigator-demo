import type { Query } from '@/app/types/http';
import { build, seg } from '@/app/utils/urlUtils';

const base = '/userApi/core';

export const siteContentApiUrlBuilder = {
  public: {
    content: () => build(`${base}/site-content`),
    page: (slug: string) => build(`${base}/site-pages/${seg(slug)}`),
    faq: () => build(`${base}/faq`),
    feedback: () => build(`${base}/feedback`),
  },
  admin: {
    content: () => build(`${base}/admin/site-content`),
    pages: () => build(`${base}/admin/site-pages`),
    page: (slug: string) => build(`${base}/admin/site-pages/${seg(slug)}`),
    faq: () => build(`${base}/admin/faq`),
    faqDetail: (id: number | string) => build(`${base}/admin/faq/${seg(id)}`),
    feedback: (query?: Query) => build(`${base}/admin/feedback`, query),
    feedbackDetail: (id: number | string) =>
      build(`${base}/admin/feedback/${seg(id)}`),
  },
} as const;
