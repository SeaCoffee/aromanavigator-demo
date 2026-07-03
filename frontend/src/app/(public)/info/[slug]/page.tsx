import SiteTextPage from '@/app/components/site/SiteTextPage';
import { getSitePageServer } from '@/app/services/siteContentServices.server';
import type { SitePageSlug } from '@/app/types/siteContentTypes';

export const dynamic = 'force-dynamic';

type Params = {
  slug: SitePageSlug;
};

export default async function InfoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  return <SiteTextPage page={await getSitePageServer(slug)} />;
}
