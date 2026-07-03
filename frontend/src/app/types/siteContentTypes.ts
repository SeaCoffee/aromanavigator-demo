export type SiteContactSettings = {
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  support_hours: string;
  footer_text: string;
  footer_site_links: string;
  footer_community_links: string;
  footer_market_links: string;
  footer_legal_links: string;
  instagram_url: string;
  facebook_url: string;
  telegram_url: string;
  updated_at: string;
};

export type SitePageSlug =
  | 'about'
  | 'fragrance-database'
  | 'cooperation'
  | 'forum-rules'
  | 'authenticity-check'
  | 'exchange-return'
  | 'terms'
  | 'privacy'
  | 'contacts';

export type SitePage = {
  id: number;
  slug: SitePageSlug;
  slug_label: string;
  title: string;
  body: string;
  is_published: boolean;
  updated_at: string;
};

export type SiteFaq = {
  id: number;
  question: string;
  answer: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PublicSiteContent = {
  contacts: SiteContactSettings;
  pages: SitePage[];
};

export type FeedbackStatus = 'new' | 'in_progress' | 'resolved' | 'spam';

export type FeedbackMessage = {
  id: number;
  user: number | null;
  user_email: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: FeedbackStatus;
  status_label: string;
  admin_note: string;
  source_path: string;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
};
