import SiteTextPage from '@/app/components/site/SiteTextPage';
import { getSitePageServer } from '@/app/services/siteContentServices.server';

export const dynamic = 'force-dynamic';

export default async function TermsPage() {
  return <SiteTextPage page={await getSitePageServer('terms')} />;
}
