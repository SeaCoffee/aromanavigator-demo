'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import LogoutButton from '@/app/components/auth/LogoutButton';
import { AppIcon } from '@/app/components/fragrances/AppLucideIcons';
import {
  getMeMenuGroups,
  type MeMenuGroup,
} from '@/app/components/me/meMenuConfig';
import { meMenuStyles as styles } from '@/app/components/me/meMenu.styles';
import { authPageUrlBuilder } from '@/app/urls/pageUrls/authPageUrlBuilder';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';

function isActivePath(pathname: string, href: string) {
  if (href === mePageUrlBuilder.home()) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getActiveHref(pathname: string, groups: MeMenuGroup[]) {
  return groups
    .flatMap((group) => group.links)
    .filter((link) => isActivePath(pathname, link.href))
    .sort((left, right) => right.href.length - left.href.length)[0]?.href;
}

function MenuLinks({
  pathname,
  groups,
}: {
  pathname: string;
  groups: MeMenuGroup[];
}) {
  const activeHref = getActiveHref(pathname, groups);

  return (
    <>
      {groups.map((group) => (
        <section key={group.title} className={styles.group}>
          <div className={styles.groupTitle}>{group.title}</div>

          {group.links.map((link) => {
            const active = link.href === activeHref;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={[
                  styles.link,
                  active ? styles.linkActive : styles.linkIdle,
                ].join(' ')}
              >
                <AppIcon name={link.icon} className={styles.linkIcon} />
                {link.label}
              </Link>
            );
          })}
        </section>
      ))}
    </>
  );
}

function MenuFooter() {
  return (
    <div className={styles.footer}>
      <LogoutButton
        redirectTo={authPageUrlBuilder.login()}
        className={styles.logout}
      />

      <Link href={mePageUrlBuilder.profile.delete()} className={styles.deleteLink}>
        Р’РёРґР°Р»РёС‚Рё Р°РєР°СѓРЅС‚
      </Link>
    </div>
  );
}

function MenuContent({
  pathname,
  groups,
  ariaLabel,
}: {
  pathname: string;
  groups: MeMenuGroup[];
  ariaLabel: string;
}) {
  return (
    <>
      <nav className={styles.nav} aria-label={ariaLabel}>
        <MenuLinks pathname={pathname} groups={groups} />
      </nav>
      <MenuFooter />
    </>
  );
}

export default function MeMenu() {
  const pathname = usePathname();
  const groups = getMeMenuGroups();

  return (
    <>
      <aside className={styles.desktop}>
        <div className={styles.header}>
          <p className={styles.title}>РћСЃРѕР±РёСЃС‚РёР№ РєР°Р±С–РЅРµС‚</p>
          <p className={styles.description}>Р’Р°С€ РїСЂРѕС„С–Р»СЊ С– РЅР°Р»Р°С€С‚СѓРІР°РЅРЅСЏ</p>
        </div>

        <MenuContent
          pathname={pathname}
          groups={groups}
          ariaLabel="РќР°РІС–РіР°С†С–СЏ РѕСЃРѕР±РёСЃС‚РѕРіРѕ РєР°Р±С–РЅРµС‚Сѓ"
        />
      </aside>

      <details className={styles.mobile}>
        <summary className={styles.mobileSummary}>
          <span>РњРµРЅСЋ РѕСЃРѕР±РёСЃС‚РѕРіРѕ РєР°Р±С–РЅРµС‚Сѓ</span>
          <AppIcon name="chevronDown" className={styles.mobileSummaryIcon} />
        </summary>

        <div className={styles.mobileBody}>
          <MenuContent
            pathname={pathname}
            groups={groups}
            ariaLabel="РњРѕР±С–Р»СЊРЅР° РЅР°РІС–РіР°С†С–СЏ РѕСЃРѕР±РёСЃС‚РѕРіРѕ РєР°Р±С–РЅРµС‚Сѓ"
          />
        </div>
      </details>
    </>
  );
}
