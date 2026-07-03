import './globals.css';

import type { Metadata, Viewport } from 'next';

import SiteHeader from '@/app/components/layout/SiteHeader';
import SiteFooter from '@/app/components/layout/SiteFooter';
import { getPublicSiteContentServer } from '@/app/services/siteContentServices.server';
import {
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_KEYWORDS,
  DEFAULT_SEO_TITLE,
  SITE_NAME,
  getMetadataBase,
  indexableRobots,
} from '@/app/utils/seoMetadata';

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: {
    default: DEFAULT_SEO_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_SEO_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'perfume',
  keywords: DEFAULT_SEO_KEYWORDS,
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  robots: indexableRobots,
  openGraph: {
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    locale: 'uk_UA',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f7efe4',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const siteContent = await getPublicSiteContentServer();

  return (
    <html lang="uk">
      <body>
        <div className="flex min-h-svh flex-col">
          <SiteHeader />

          <div className="min-h-[60vh] flex-1">
            {children}
          </div>

          <SiteFooter content={siteContent} />
        </div>
      </body>
    </html>
  );
}
