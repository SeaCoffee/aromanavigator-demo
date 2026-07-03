import {
  actionResultMessage,
  isSuccessMessage,
} from '@/app/actions/actionHelpers/fragranceActionHelpers';
import {
  noteLevelLabels,
  noteLevelOptions,
} from '@/app/components/fragrances/fragranceAdminLabels';

import type {
  ModerationStatus,
  NoteLevel,
} from '@/app/types/fragranceTypes';

export { actionResultMessage, isSuccessMessage };

export const MODERATION_STATUS_OPTIONS: ModerationStatus[] = [
  'pending',
  'approved',
  'rejected',
];

export const NOTE_LEVEL_OPTIONS: Array<{
  value: NoteLevel;
  label: string;
}> = noteLevelOptions;

export function noteLevelLabel(level: NoteLevel) {
  return noteLevelLabels[level];
}

export function setFormValue(
  formData: FormData,
  key: string,
  value: string | number | null | undefined,
) {
  if (value === undefined || value === null) return;

  formData.set(key, String(value));
}
