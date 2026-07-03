// frontend/src/app/types/notificationTypes.ts

export type PaginatedResponse<T> = {
  total_items: number;
  total_pages: number;
  next: boolean;
  prev: boolean;
  results: T[];
};

export type NotificationRef = {
  type: string;
  app: string;
  model: string;
  id: number;
  display_name: string;
  is_available?: boolean;
};

export type NotificationPayload = Record<string, unknown>;

export type NotificationItem = {
  id: number;
  actor: NotificationRef | null;
  verb: string;
  target: NotificationRef | null;
  payload: NotificationPayload;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NotificationListQuery = {
  page?: string | number;
  is_read?: boolean | string;
  verb?: string;
  ordering?: string;
};

export type NotificationUnreadCountResponse = {
  unread_count: number;
};

export type NotificationAnnouncementKind =
  | 'rules'
  | 'maintenance'
  | 'promo'
  | 'site_update'
  | 'other';

export type NotificationAnnouncement = {
  id: number;
  kind: NotificationAnnouncementKind;
  kind_label: string;
  title: string;
  body: string;
  is_active: boolean;
  is_read: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type NotificationAnnouncementInput = {
  kind?: NotificationAnnouncementKind;
  title: string;
  body: string;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
};

export type NotificationAnnouncementUpdateInput =
  Partial<NotificationAnnouncementInput>;

export type NotificationUpdatedResponse = {
  updated: number;
};

export type NotificationDeletedResponse = {
  deleted: number;
};

export type NotificationActionResult =
  | { ok: true; msg?: string }
  | { ok: false; msg: string };
