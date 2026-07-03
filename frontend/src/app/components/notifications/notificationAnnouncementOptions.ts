import type { NotificationAnnouncementKind } from '@/app/types/notificationTypes';

export const notificationAnnouncementKindOptions: Array<{
  value: NotificationAnnouncementKind;
  label: string;
}> = [
  { value: 'rules', label: 'РќРѕРІС– РїСЂР°РІРёР»Р°' },
  { value: 'maintenance', label: 'РўРµС…РЅС–С‡РЅС– СЂРѕР±РѕС‚Рё' },
  { value: 'promo', label: 'РђРєС†С–СЏ' },
  { value: 'site_update', label: 'РћРЅРѕРІР»РµРЅРЅСЏ СЃР°Р№С‚Сѓ' },
  { value: 'other', label: 'РћРіРѕР»РѕС€РµРЅРЅСЏ' },
];
