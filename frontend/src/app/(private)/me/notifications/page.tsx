import NotificationAnnouncementList from '@/app/components/notifications/NotificationAnnouncementList';
import NotificationList from '@/app/components/notifications/NotificationList';
import NotificationToolbar from '@/app/components/notifications/NotificationToolbar';
import { notificationStyles } from '@/app/components/notifications/notificationStyles';
import { requireUserOrRedirect } from '@/app/lib/session';
import {
  getNotificationAnnouncementsServer,
  getMyNotificationsServer,
  getNotificationsUnreadCountServer,
} from '@/app/services/notificationServerServices';
import type { Query } from '@/app/types/http';
import SimplePagination from '@/app/utils/SimplePagination';
import {
  buildPageQuery,
  currentPageFromParams,
} from '@/app/utils/searchParamsUtils';
import { paginatedTotal } from '@/app/utils/valueUtils';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getQuery(searchParams?: Record<string, string | string[] | undefined>): Query {
  const page = searchParams?.page;
  const isRead = searchParams?.is_read;
  const verb = searchParams?.verb;
  const ordering = searchParams?.ordering;

  return {
    page: typeof page === 'string' ? page : undefined,
    is_read: typeof isRead === 'string' ? isRead : undefined,
    verb: typeof verb === 'string' ? verb : undefined,
    ordering: typeof ordering === 'string' ? ordering : undefined,
  };
}

export default async function MyNotificationsPage({ searchParams }: Props) {
  await requireUserOrRedirect();

  const resolvedSearchParams = await searchParams;
  const [notificationsPage, announcementsPage, unreadCountData] = await Promise.all([
    getMyNotificationsServer(getQuery(resolvedSearchParams)),
    getNotificationAnnouncementsServer({ size: 20 }),
    getNotificationsUnreadCountServer(),
  ]);
  const totalCount =
    paginatedTotal(notificationsPage) + paginatedTotal(announcementsPage);
  const page = currentPageFromParams(resolvedSearchParams ?? {});

  return (
    <main className={notificationStyles.page}>
      <header className={notificationStyles.header}>
        <h1 className={notificationStyles.title}>РЎРїРѕРІС–С‰РµРЅРЅСЏ</h1>
        <p className={notificationStyles.subtitle}>
          РќРѕРІС– СЂРµР°РєС†С–С—, РєРѕРјРµРЅС‚Р°СЂС–, РѕР±РјС–РЅРё, Р·Р°РјРѕРІР»РµРЅРЅСЏ С‚Р° РѕРіРѕР»РѕС€РµРЅРЅСЏ РїР»Р°С‚С„РѕСЂРјРё.
        </p>
      </header>

      <NotificationToolbar
        totalCount={totalCount}
        unreadCount={unreadCountData.unread_count}
      />

      <NotificationAnnouncementList announcements={announcementsPage.results} />
      <NotificationList notifications={notificationsPage.results} />
      <SimplePagination
        page={page}
        pageSize={20}
        totalItems={notificationsPage.total_items}
        hrefForPage={(nextPage) =>
          mePageUrlBuilder.notifications.list(
            buildPageQuery(resolvedSearchParams ?? {}, nextPage),
          )
        }
      />
    </main>
  );
}
