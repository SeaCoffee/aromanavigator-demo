"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  adminMenuGroups,
  type AdminMenuGroup,
} from "@/app/components/admin/adminMenuConfig";
import { adminMenuStyles as styles } from "@/app/components/admin/adminMenu.styles";
import { AppIcon } from "@/app/components/fragrances/AppLucideIcons";
import { adminPageUrlBuilder } from "@/app/urls/pageUrls/adminPageUrlBuilder";
import { mePageUrlBuilder } from "@/app/urls/pageUrls/mePageUrlBuilder";

function isActivePath(pathname: string, href: string) {
  if (href === adminPageUrlBuilder.home()) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getActiveHref(pathname: string, groups: AdminMenuGroup[]) {
  return groups
    .flatMap((group) => group.links)
    .filter((link) => isActivePath(pathname, link.href))
    .sort((left, right) => right.href.length - left.href.length)[0]?.href;
}

function MenuLinks({
  pathname,
  isAdmin,
}: {
  pathname: string;
  isAdmin: boolean;
}) {
  const groups = adminMenuGroups.map((group) => ({
    ...group,
    links: group.links.filter((link) => !link.adminOnly || isAdmin),
  }));
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
                aria-current={active ? "page" : undefined}
                className={[
                  styles.link,
                  active ? styles.linkActive : styles.linkIdle,
                ].join(" ")}
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

function MenuContent({
  pathname,
  ariaLabel,
  isAdmin,
}: {
  pathname: string;
  ariaLabel: string;
  isAdmin: boolean;
}) {
  return (
    <>
      <nav className={styles.nav} aria-label={ariaLabel}>
        <MenuLinks pathname={pathname} isAdmin={isAdmin} />
      </nav>

      <div className={styles.footer}>
        <Link href={mePageUrlBuilder.home()} className={styles.cabinetLink}>
          <AppIcon name="account" className={styles.linkIcon} />
          РћСЃРѕР±РёСЃС‚РёР№ РєР°Р±С–РЅРµС‚
        </Link>
      </div>
    </>
  );
}

export default function AdminMenu({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <>
      <aside className={styles.desktop}>
        <div className={styles.header}>
          <Link href={adminPageUrlBuilder.home()} className={styles.title}>
            РђРґРјС–РЅ-РїР°РЅРµР»СЊ
          </Link>
          <p className={styles.description}>РљРµСЂСѓРІР°РЅРЅСЏ СЃР°Р№С‚РѕРј С– РјРѕРґРµСЂР°С†С–СЏ</p>
        </div>

        <MenuContent
          pathname={pathname}
          ariaLabel="РќР°РІС–РіР°С†С–СЏ Р°РґРјС–РЅ-РїР°РЅРµР»С–"
          isAdmin={isAdmin}
        />
      </aside>

      <details className={styles.mobile}>
        <summary className={styles.mobileSummary}>
          <span>РњРµРЅСЋ Р°РґРјС–РЅ-РїР°РЅРµР»С–</span>
          <AppIcon name="chevronDown" className={styles.mobileSummaryIcon} />
        </summary>

        <div className={styles.mobileBody}>
          <MenuContent
            pathname={pathname}
            ariaLabel="РњРѕР±С–Р»СЊРЅР° РЅР°РІС–РіР°С†С–СЏ Р°РґРјС–РЅ-РїР°РЅРµР»С–"
            isAdmin={isAdmin}
          />
        </div>
      </details>
    </>
  );
}
