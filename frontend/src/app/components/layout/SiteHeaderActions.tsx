import Link from 'next/link';

import { AppIcon } from '@/app/components/fragrances/AppLucideIcons';
import {
  siteHeaderActionItems,
} from '@/app/components/layout/siteHeader.navigation';
import SiteHeaderNotificationLink from '@/app/components/layout/SiteHeaderNotificationLink';
import { siteHeaderStyles as styles } from '@/app/components/layout/siteHeader.styles';

export default async function SiteHeaderActions() {
  return (
    <div className={styles.actions} aria-label="РЁРІРёРґРєС– РґС–С—">
      {siteHeaderActionItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.actionLink} ${
            item.icon === 'search' ? styles.mobileHiddenAction : ''
          }`}
          aria-label={item.label}
        >
          <AppIcon name={item.icon} className={styles.actionIcon} />
        </Link>
      ))}

      <SiteHeaderNotificationLink />
    </div>
  );
}
