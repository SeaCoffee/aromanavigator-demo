'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AppIcon } from '@/app/components/fragrances/AppLucideIcons';
import { siteHeaderNavItems } from '@/app/components/layout/siteHeader.navigation';
import { siteHeaderStyles as styles } from '@/app/components/layout/siteHeader.styles';

const extraMobileNavItems = [
  { label: 'РџСЂРѕ РЅР°СЃ', href: '/about' },
  { label: 'РљРѕРЅС‚Р°РєС‚Рё', href: '/contacts' },
  { label: 'FAQ', href: '/faq' },
];

export default function SiteHeaderNav() {
  const pathname = usePathname();
  const mobileNavRef = useRef<HTMLDetailsElement | null>(null);

  const closeMobileNav = () => {
    if (mobileNavRef.current) {
      mobileNavRef.current.open = false;
    }
  };

  useEffect(() => {
    closeMobileNav();
  }, [pathname]);

  return (
    <>
      <nav className={styles.nav} aria-label="Р“РѕР»РѕРІРЅР° РЅР°РІС–РіР°С†С–СЏ">
        {siteHeaderNavItems.map((item) => (
          <Link key={item.href} href={item.href} className={styles.navLink}>
            {item.label}
          </Link>
        ))}
      </nav>

      <details ref={mobileNavRef} className={styles.mobileNav}>
        <summary className={styles.mobileNavSummary} aria-label="РњРµРЅСЋ">
          <AppIcon name="menu" />
        </summary>

        <nav className={styles.mobileNavPanel} aria-label="РњРѕР±С–Р»СЊРЅР° РЅР°РІС–РіР°С†С–СЏ">
          {siteHeaderNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileNavLink}
              onClick={closeMobileNav}
            >
              {item.label}
            </Link>
          ))}

          {extraMobileNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={styles.mobileNavLink}
              onClick={closeMobileNav}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </details>
    </>
  );
}
