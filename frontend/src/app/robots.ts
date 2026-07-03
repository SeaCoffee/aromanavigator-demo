import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/app/constants/siteConstants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/me/',
        '/login',
        '/register',
        '/recovery',
        '/activate/',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
