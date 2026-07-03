import Link from 'next/link';

import SiteHeaderActions from '@/app/components/layout/SiteHeaderActions';
import SiteHeaderNav from '@/app/components/layout/SiteHeaderNav';
import {
  siteHeaderStripText,
} from '@/app/components/layout/siteHeader.navigation';
import { siteHeaderStyles as styles } from '@/app/components/layout/siteHeader.styles';
import { sitePageUrlBuilder } from '@/app/urls/pageUrls/sitePageUrlBuilder';

export default function SiteHeader() {
  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <Link href={sitePageUrlBuilder.public.home()} className={styles.brand}>
          AromaNavigator
        </Link>

        <SiteHeaderNav />

        <SiteHeaderActions />
      </div>

      <div className={styles.strip}>
        <div className={styles.stripInner}>{siteHeaderStripText}</div>
      </div>
    </header>
  );
}
