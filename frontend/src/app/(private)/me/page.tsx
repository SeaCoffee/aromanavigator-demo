import React from "react";
import Link from "next/link";

import AvatarImage from "@/app/components/images/AvatarImage";
import { meDashboardStyles as styles } from "@/app/components/me/meDashboard.styles";
import ShareButton from "@/app/components/share/ShareButton";
import { getRegionLabel } from "@/app/constants/regionOptions";
import { siteUrl } from "@/app/constants/siteConstants";
import { requireUserOrRedirect } from "@/app/lib/session";
import { mePageUrlBuilder } from "@/app/urls/pageUrls/mePageUrlBuilder";
import { userPageUrlBuilder } from "@/app/urls/pageUrls/usersPageUrlBuilder";

function getDisplayName(
  user: Awaited<ReturnType<typeof requireUserOrRedirect>>,
) {
  return user.profile?.display_name || user.profile?.name || "my-profile";
}

function getInitial(displayName: string) {
  return displayName.slice(0, 1).toUpperCase();
}

export default async function MeHomePage() {
  const user = await requireUserOrRedirect();
  const displayName = getDisplayName(user);
  const publicHref = userPageUrlBuilder.publicProfile(displayName);
  const shareUrl = siteUrl(publicHref);
  const stats = user.stats;
  const regionLabel = getRegionLabel(user.profile?.region) || "РЅРµ РІРєР°Р·Р°РЅРѕ";

  const statItems = [
    {
      label: "РџС–РґРїРёСЃРЅРёРєРё",
      value: stats?.followers_count ?? 0,
      href: mePageUrlBuilder.followers(),
    },
    {
      label: "РџС–РґРїРёСЃРєРё",
      value: stats?.following_count ?? 0,
      href: mePageUrlBuilder.following(),
    },
    {
      label: "РЎРїРѕРІС–С‰РµРЅРЅСЏ",
      value: stats?.notifications_unread_count ?? 0,
      href: mePageUrlBuilder.notifications.list(),
    },
  ];

  const dashboardSections = [
    {
      label: "РџСЂРѕС„С–Р»СЊ",
      text: "РћРЅРѕРІС–С‚СЊ С–РјКјСЏ, РїСѓР±Р»С–С‡РЅРёР№ РЅС–РєРЅРµР№Рј, СЂРµРіС–РѕРЅ, РѕРїРёСЃ С– РґР°РЅС– РґР»СЏ РїСѓР±Р»С–С‡РЅРѕС— СЃС‚РѕСЂС–РЅРєРё.",
      href: mePageUrlBuilder.profile.edit(),
      icon: "P",
    },
    {
      label: "РџР°СЂС„СѓРјРµСЂРЅРёР№ РїСЂРѕС„С–Р»СЊ",
      text: "РџРѕР·РЅР°С‡С‚Рµ СѓР»СЋР±Р»РµРЅС– РЅРѕС‚Рё, СЃС–РјРµР№СЃС‚РІР°, Р±СЂРµРЅРґРё, РїР°СЂС„СѓРјРµСЂС–РІ С– Р°СЂРѕРјР°С‚Рё, СЏРєС– С€СѓРєР°С”С‚Рµ.",
      href: mePageUrlBuilder.perfumeProfile.detail(),
      icon: "вњ¦",
    },
    {
      label: "Р“Р°СЂРґРµСЂРѕР±",
      text: "Р—Р±РµСЂС–РіР°Р№С‚Рµ РІР»Р°СЃРЅСѓ РєРѕР»РµРєС†С–СЋ Р°СЂРѕРјР°С‚С–РІ, СЃС‚Р°С‚СѓСЃРё, РѕР±КјС”РјРё С‚Р° РїСЂРёРІР°С‚РЅС– РЅРѕС‚Р°С‚РєРё.",
      href: mePageUrlBuilder.wardrobe.list(),
      icon: "в–Ў",
    },
    {
      label: "РћР±РјС–РЅРё",
      text: "РџРµСЂРµРіР»СЏРґР°Р№С‚Рµ РІС…С–РґРЅС– С‚Р° РІРёС…С–РґРЅС– РїСЂРѕРїРѕР·РёС†С–С— РѕР±РјС–РЅСѓ РјС–Р¶ РєРѕСЂРёСЃС‚СѓРІР°С‡Р°РјРё.",
      href: mePageUrlBuilder.exchange.list(),
      icon: "в†—",
    },
  ];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.profile}>
          <AvatarImage
            src={user.profile?.avatar_url}
            initial={getInitial(displayName)}
            className={styles.avatar}
            fallbackClassName={styles.avatarFallback}
          />

          <div className={styles.profileText}>
            <p className={styles.eyebrow}>РћСЃРѕР±РёСЃС‚РёР№ РєР°Р±С–РЅРµС‚</p>

            <h1 className={styles.title}>{displayName}</h1>

            <p className={styles.subtitle}>
              {user.profile?.about_me ||
                "РўСѓС‚ Р·С–Р±СЂР°РЅС– РІР°С€ РїСЂРѕС„С–Р»СЊ, РїР°СЂС„СѓРјРµСЂРЅРёР№ РїРѕСЂС‚СЂРµС‚, РіР°СЂРґРµСЂРѕР±, РѕРіРѕР»РѕС€РµРЅРЅСЏ, Р·Р°РјРѕРІР»РµРЅРЅСЏ С‚Р° РІР·Р°С”РјРѕРґС–СЏ Р·С– СЃРїС–Р»СЊРЅРѕС‚РѕСЋ."}
            </p>

            <div className={styles.statusRow}>
              {user.account_type === "premium" ? (
                <span className={styles.badge}>Premium</span>
              ) : null}

              {user.email_verified ? (
                <span className={styles.badge}>Email РїС–РґС‚РІРµСЂРґР¶РµРЅРѕ</span>
              ) : (
                <span className={styles.dangerBadge}>
                  Email РЅРµ РїС–РґС‚РІРµСЂРґР¶РµРЅРѕ
                </span>
              )}

              {user.is_seller ? (
                <span className={styles.badge}>РџСЂРѕРґР°РІРµС†СЊ</span>
              ) : null}

              {user.is_suspended ? (
                <span className={styles.dangerBadge}>РђРєР°СѓРЅС‚ Р·Р°Р±Р»РѕРєРѕРІР°РЅРѕ</span>
              ) : (
                <span className={styles.badge}>РђРєР°СѓРЅС‚ Р°РєС‚РёРІРЅРёР№</span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Link href={publicHref} className={styles.primaryLink}>
            РџСѓР±Р»С–С‡РЅРёР№ РїСЂРѕС„С–Р»СЊ
          </Link>

          <ShareButton
            url={shareUrl}
            title={`РџСЂРѕС„С–Р»СЊ ${displayName}`}
            text="РњС–Р№ РїСѓР±Р»С–С‡РЅРёР№ РїСЂРѕС„С–Р»СЊ."
          />
        </div>
      </section>

      <section className={styles.statsGrid} aria-label="РЎС‚Р°С‚РёСЃС‚РёРєР° РїСЂРѕС„С–Р»СЋ">
        {statItems.map((item) => (
          <Link key={item.href} href={item.href} className={styles.statCard}>
            <p className={styles.statLabel}>{item.label}</p>

            <div className="mt-2 flex items-end justify-between gap-3">
              <p className={styles.statValue}>{item.value}</p>
              <span
                aria-hidden="true"
                className="pb-1 text-sm font-black text-[#9b6847] opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100"
              >
                в†’
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section className={styles.bodyGrid}>
        <article className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>РћСЃРЅРѕРІРЅС– СЂРѕР·РґС–Р»Рё</h2>
          </div>

          <div className={styles.dashboardCards}>
            {dashboardSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className={styles.dashboardCard}
              >
                <span className={styles.dashboardCardTop}>
                  <span className={styles.dashboardCardContent}>
                    <span className={styles.dashboardCardTitle}>
                      {section.label}
                    </span>

                    <span className={styles.dashboardCardText}>
                      {section.text}
                    </span>
                  </span>

                  <span className={styles.dashboardCardIcon}>
                    {section.icon}
                  </span>
                </span>

                <span className={styles.dashboardCardFooter}>
                  РџРµСЂРµР№С‚Рё <span aria-hidden="true">в†’</span>
                </span>
              </Link>
            ))}
          </div>
        </article>

        <aside className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>РџСЂРѕС„С–Р»СЊ С– РґРѕСЃС‚СѓРї</h2>

            <p className={styles.panelText}>
              РћСЃРЅРѕРІРЅС– РґР°РЅС– Р°РєР°СѓРЅС‚Р°, СЏРєС– РІРїР»РёРІР°СЋС‚СЊ РЅР° РІРїС–Р·РЅР°РІР°РЅС–СЃС‚СЊ РїСЂРѕС„С–Р»СЋ С‚Р°
              РґРѕСЃС‚СѓРї РґРѕ С„СѓРЅРєС†С–Р№ СЃР°Р№С‚Сѓ.
            </p>
          </div>

          <div className={styles.accountList}>
            <div className={styles.accountRow}>
              <span className={styles.accountLabel}>Р†РјКјСЏ</span>
              <span className={styles.accountValue}>
                {user.profile?.name || "РЅРµ РІРєР°Р·Р°РЅРѕ"}
              </span>
            </div>

            <div className={styles.accountRow}>
              <span className={styles.accountLabel}>Email РґР»СЏ РІС…РѕРґСѓ</span>
              <span className={styles.accountValue}>{user.email}</span>
            </div>

            <div className={styles.accountRow}>
              <span className={styles.accountLabel}>Р РµРіС–РѕРЅ</span>
              <span className={styles.accountValue}>{regionLabel}</span>
            </div>
          </div>

          {!user.profile?.name || !user.profile?.region ? (
            <p className={styles.softNotice}>
              Р—Р°РїРѕРІРЅРµРЅРёР№ РїСЂРѕС„С–Р»СЊ РІРёРіР»СЏРґР°С” РґРѕРІС–СЂР»РёРІС–С€Рµ РґР»СЏ С–РЅС€РёС… РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ:
              РґРѕРґР°Р№С‚Рµ С–РјКјСЏ, СЂРµРіС–РѕРЅ С– РєРѕСЂРѕС‚РєРёР№ РѕРїРёСЃ.
            </p>
          ) : null}

          {user.is_suspended ? (
            <p className={styles.warningNotice}>
              {user.suspended_indefinitely
                ? "РђРєР°СѓРЅС‚ Р·Р°Р±Р»РѕРєРѕРІР°РЅРѕ Р±РµР·СЃС‚СЂРѕРєРѕРІРѕ."
                : `Р‘Р»РѕРєСѓРІР°РЅРЅСЏ РґС–С” РґРѕ ${user.suspended_until ?? "РІРєР°Р·Р°РЅРѕС— РґР°С‚Рё"}.`}
            </p>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
