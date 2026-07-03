import 'server-only';

import { cache } from 'react';

import { djangoJson } from '@/app/services/djangoClient.server';
import type { Paginated, Query } from '@/app/types/http';
import type {
  FeedbackMessage,
  PublicSiteContent,
  SiteContactSettings,
  SiteFaq,
  SitePage,
  SitePageSlug,
} from '@/app/types/siteContentTypes';
import { siteContentApiUrlBuilder } from '@/app/urls/siteContentApiUrlBuilder';

const emptyContacts: SiteContactSettings = {
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  support_hours: '',
  footer_text: '',
  footer_site_links: '',
  footer_community_links: '',
  footer_market_links: '',
  footer_legal_links: '',
  instagram_url: '',
  facebook_url: '',
  telegram_url: '',
  updated_at: '',
};

export const getPublicSiteContentServer = cache(async () => {
  try {
    return await djangoJson<PublicSiteContent>(
      siteContentApiUrlBuilder.public.content(),
      { auth: 'none', cache: 'no-store' },
    );
  } catch {
    return { contacts: emptyContacts, pages: [] };
  }
});

export const getSitePageServer = (slug: SitePageSlug) =>
  djangoJson<SitePage>(siteContentApiUrlBuilder.public.page(slug), {
    auth: 'none',
    cache: 'no-store',
  });

export const getFaqServer = () =>
  djangoJson<SiteFaq[]>(siteContentApiUrlBuilder.public.faq(), {
    auth: 'none',
    cache: 'no-store',
  });

export const createFeedbackServer = (payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
  source_path?: string;
  website?: string;
}) =>
  djangoJson<FeedbackMessage, typeof payload>(
    siteContentApiUrlBuilder.public.feedback(),
    { method: 'POST', auth: 'auto', json: payload },
  );

export const getAdminSiteContentServer = () =>
  djangoJson<SiteContactSettings>(siteContentApiUrlBuilder.admin.content(), {
    auth: 'required',
    cache: 'no-store',
  });

export const updateAdminSiteContentServer = (
  payload: Partial<SiteContactSettings>,
) =>
  djangoJson<SiteContactSettings>(siteContentApiUrlBuilder.admin.content(), {
    method: 'PATCH',
    auth: 'required',
    json: payload,
  });

export const getAdminSitePagesServer = () =>
  djangoJson<SitePage[]>(siteContentApiUrlBuilder.admin.pages(), {
    auth: 'required',
    cache: 'no-store',
  });

export const updateAdminSitePageServer = (
  slug: SitePageSlug,
  payload: Partial<Pick<SitePage, 'title' | 'body' | 'is_published'>>,
) =>
  djangoJson<SitePage>(siteContentApiUrlBuilder.admin.page(slug), {
    method: 'PATCH',
    auth: 'required',
    json: payload,
  });

export const getAdminFaqServer = () =>
  djangoJson<SiteFaq[]>(siteContentApiUrlBuilder.admin.faq(), {
    auth: 'required',
    cache: 'no-store',
  });

export const createAdminFaqServer = (
  payload: Pick<SiteFaq, 'question' | 'answer' | 'position' | 'is_active'>,
) =>
  djangoJson<SiteFaq>(siteContentApiUrlBuilder.admin.faq(), {
    method: 'POST',
    auth: 'required',
    json: payload,
  });

export const updateAdminFaqServer = (
  id: number | string,
  payload: Partial<
    Pick<SiteFaq, 'question' | 'answer' | 'position' | 'is_active'>
  >,
) =>
  djangoJson<SiteFaq>(siteContentApiUrlBuilder.admin.faqDetail(id), {
    method: 'PATCH',
    auth: 'required',
    json: payload,
  });

export const deleteAdminFaqServer = (id: number | string) =>
  djangoJson<void>(siteContentApiUrlBuilder.admin.faqDetail(id), {
    method: 'DELETE',
    auth: 'required',
  });

export const getAdminFeedbackServer = (query: Query = {}) =>
  djangoJson<Paginated<FeedbackMessage>>(
    siteContentApiUrlBuilder.admin.feedback(query),
    { auth: 'required', cache: 'no-store' },
  );

export const getAdminFeedbackDetailServer = (id: number | string) =>
  djangoJson<FeedbackMessage>(
    siteContentApiUrlBuilder.admin.feedbackDetail(id),
    { auth: 'required', cache: 'no-store' },
  );

export const updateAdminFeedbackServer = (
  id: number | string,
  payload: Pick<FeedbackMessage, 'status' | 'admin_note'>,
) =>
  djangoJson<FeedbackMessage>(
    siteContentApiUrlBuilder.admin.feedbackDetail(id),
    { method: 'PATCH', auth: 'required', json: payload },
  );
