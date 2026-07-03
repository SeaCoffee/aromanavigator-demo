import AdminNotificationAnnouncementForm from "@/app/components/notifications/AdminNotificationAnnouncementForm";
import AdminNotificationAnnouncementList from "@/app/components/notifications/AdminNotificationAnnouncementList";
import { notificationStyles } from "@/app/components/notifications/notificationStyles";
import { getAdminNotificationAnnouncementsServer } from "@/app/services/notificationServerServices";
import type { Query } from "@/app/types/http";
import { adminPageUrlBuilder } from "@/app/urls/pageUrls/adminPageUrlBuilder";
import SimplePagination from "@/app/utils/SimplePagination";
import { paginatedTotal } from "@/app/utils/valueUtils";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getQuery(
  searchParams?: Record<string, string | string[] | undefined>,
): Query {
  const page = searchParams?.page;

  return {
    page: typeof page === "string" ? page : undefined,
    page_size: 20,
  };
}

export default async function AdminNotificationAnnouncementsPage({
  searchParams,
}: Props) {
  const resolvedSearchParams = await searchParams;
  const announcementsPage = await getAdminNotificationAnnouncementsServer(
    getQuery(resolvedSearchParams),
  );

  return (
    <main className={notificationStyles.page}>
      <header className={notificationStyles.header}>
        <h1 className={notificationStyles.title}>РћРіРѕР»РѕС€РµРЅРЅСЏ Сѓ РґР·РІС–РЅРѕС‡РѕРє</h1>
        <p className={notificationStyles.subtitle}>
          РќРѕРІС– РїСЂР°РІРёР»Р°, С‚РµС…РЅС–С‡РЅС– СЂРѕР±РѕС‚Рё, Р°РєС†С–С— С‚Р° РѕРЅРѕРІР»РµРЅРЅСЏ СЃР°Р№С‚Сѓ РґР»СЏ РІСЃС–С…
          РєРѕСЂРёСЃС‚СѓРІР°С‡С–РІ.
        </p>
      </header>

      <section className={notificationStyles.card}>
        <h2 className={notificationStyles.sectionTitle}>РЎС‚РІРѕСЂРёС‚Рё РѕРіРѕР»РѕС€РµРЅРЅСЏ</h2>
        <AdminNotificationAnnouncementForm />
      </section>

      <section className={notificationStyles.section}>
        <h2 className={notificationStyles.sectionTitle}>РЈСЃС– РѕРіРѕР»РѕС€РµРЅРЅСЏ</h2>
        <AdminNotificationAnnouncementList
          announcements={announcementsPage.results}
        />
        <SimplePagination
          hrefForPage={(page) =>
            adminPageUrlBuilder.notifications.announcements({ page })
          }
          page={Number(resolvedSearchParams?.page || 1)}
          pageSize={20}
          totalItems={paginatedTotal(announcementsPage)}
        />
      </section>
    </main>
  );
}
