'use server';

import { revalidatePath } from 'next/cache';

import {
  createNotificationAnnouncementServer,
  deleteNotificationAnnouncementServer,
  deleteNotificationServer,
  deleteReadNotificationsServer,
  markNotificationAnnouncementReadServer,
  markAllNotificationsReadServer,
  markNotificationReadServer,
  recomputeNotificationsUnreadCountServer,
  updateNotificationAnnouncementServer,
} from '@/app/services/notificationServerServices';
import type { NotificationActionResult } from '@/app/types/notificationTypes';
import { adminPageUrlBuilder } from '@/app/urls/pageUrls/adminPageUrlBuilder';
import { mePageUrlBuilder } from '@/app/urls/pageUrls/mePageUrlBuilder';
import { getApiErrorMessage } from '@/errors/ApiError';

function getErrorMessage(error: unknown): string {
  return getApiErrorMessage(error, 'РќРµ РІРґР°Р»РѕСЃСЏ РѕРЅРѕРІРёС‚Рё СЃРїРѕРІС–С‰РµРЅРЅСЏ.');
}

function refreshNotifications() {
  revalidatePath(mePageUrlBuilder.notifications.list());
  revalidatePath(mePageUrlBuilder.home());
}

function refreshAnnouncementAdmin() {
  refreshNotifications();
  revalidatePath(adminPageUrlBuilder.notifications.announcements());
}

function readString(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function readOptionalString(formData: FormData, key: string): string | undefined {
  const value = readString(formData, key);

  return value || undefined;
}

function readNullableString(formData: FormData, key: string): string | null {
  const value = readString(formData, key);

  return value || null;
}

function readBoolean(formData: FormData, key: string): boolean {
  const value = readString(formData, key);

  return value === '1' || value === 'true' || value === 'on';
}

export async function markNotificationReadAction(
  notificationId: number,
): Promise<NotificationActionResult> {
  try {
    await markNotificationReadServer(notificationId);
    refreshNotifications();

    return { ok: true, msg: 'РЎРїРѕРІС–С‰РµРЅРЅСЏ РїСЂРѕС‡РёС‚Р°РЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error) };
  }
}

export async function markNotificationAnnouncementReadAction(
  announcementId: number,
): Promise<NotificationActionResult> {
  try {
    await markNotificationAnnouncementReadServer(announcementId);
    refreshNotifications();

    return { ok: true, msg: 'РћРіРѕР»РѕС€РµРЅРЅСЏ РїСЂРѕС‡РёС‚Р°РЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error) };
  }
}

export async function markAllNotificationsReadAction(): Promise<NotificationActionResult> {
  try {
    await markAllNotificationsReadServer();
    refreshNotifications();

    return { ok: true, msg: 'РЈСЃС– СЃРїРѕРІС–С‰РµРЅРЅСЏ РїСЂРѕС‡РёС‚Р°РЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error) };
  }
}

export async function createNotificationAnnouncementAction(
  _prev: NotificationActionResult | null,
  formData: FormData,
): Promise<NotificationActionResult> {
  try {
    await createNotificationAnnouncementServer({
      kind: readOptionalString(formData, 'kind') as never,
      title: readString(formData, 'title'),
      body: readString(formData, 'body'),
      is_active: readBoolean(formData, 'is_active'),
      starts_at: readNullableString(formData, 'starts_at'),
      ends_at: readNullableString(formData, 'ends_at'),
    });

    refreshAnnouncementAdmin();

    return { ok: true, msg: 'РћРіРѕР»РѕС€РµРЅРЅСЏ СЃС‚РІРѕСЂРµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error) };
  }
}

export async function updateNotificationAnnouncementAction(
  _prev: NotificationActionResult | null,
  formData: FormData,
): Promise<NotificationActionResult> {
  try {
    const id = readString(formData, 'id');

    await updateNotificationAnnouncementServer(id, {
      kind: readOptionalString(formData, 'kind') as never,
      title: readOptionalString(formData, 'title'),
      body: readOptionalString(formData, 'body'),
      is_active: readBoolean(formData, 'is_active'),
      starts_at: readNullableString(formData, 'starts_at'),
      ends_at: readNullableString(formData, 'ends_at'),
    });

    refreshAnnouncementAdmin();

    return { ok: true, msg: 'РћРіРѕР»РѕС€РµРЅРЅСЏ РѕРЅРѕРІР»РµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error) };
  }
}

export async function deleteNotificationAnnouncementAction(
  _prev: NotificationActionResult | null,
  formData: FormData,
): Promise<NotificationActionResult> {
  try {
    await deleteNotificationAnnouncementServer(readString(formData, 'id'));
    refreshAnnouncementAdmin();

    return { ok: true, msg: 'РћРіРѕР»РѕС€РµРЅРЅСЏ РІРёРґР°Р»РµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error) };
  }
}

export async function deleteNotificationAction(
  notificationId: number,
): Promise<NotificationActionResult> {
  try {
    await deleteNotificationServer(notificationId);
    refreshNotifications();

    return { ok: true, msg: 'РЎРїРѕРІС–С‰РµРЅРЅСЏ РІРёРґР°Р»РµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error) };
  }
}

export async function deleteReadNotificationsAction(): Promise<NotificationActionResult> {
  try {
    await deleteReadNotificationsServer();
    refreshNotifications();

    return { ok: true, msg: 'РџСЂРѕС‡РёС‚Р°РЅС– СЃРїРѕРІС–С‰РµРЅРЅСЏ РІРёРґР°Р»РµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error) };
  }
}

export async function recomputeNotificationsUnreadCountAction(): Promise<NotificationActionResult> {
  try {
    await recomputeNotificationsUnreadCountServer();
    refreshNotifications();

    return { ok: true, msg: 'Р›С–С‡РёР»СЊРЅРёРє РѕРЅРѕРІР»РµРЅРѕ.' };
  } catch (error) {
    return { ok: false, msg: getErrorMessage(error) };
  }
}
