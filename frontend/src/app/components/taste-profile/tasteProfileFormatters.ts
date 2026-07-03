import {
  TASTE_ATTITUDE_OPTIONS,
  TASTE_CONCENTRATION_OPTIONS,
  TASTE_FRAGRANCE_MARK_OPTIONS,
  TASTE_PRIORITY_OPTIONS,
  TASTE_SEASON_OPTIONS,
} from '@/app/constants/tasteProfileOptions';
import type {
  TasteAttitude,
  TasteConcentration,
  TasteFragranceMark,
  TastePriority,
  TasteSeason,
} from '@/app/types/tasteProfileTypes';

type MessageLike = string | string[] | Record<string, unknown> | undefined;

function labelFrom<T extends string>(
  options: Array<{ value: T; label: string }>,
  value: T | string,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export const tasteAttitudeLabel = (value: TasteAttitude | string) =>
  labelFrom(TASTE_ATTITUDE_OPTIONS, value);

export const tasteSeasonLabel = (value: TasteSeason | string) =>
  labelFrom(TASTE_SEASON_OPTIONS, value);

export const tasteConcentrationLabel = (value: TasteConcentration | string) =>
  labelFrom(TASTE_CONCENTRATION_OPTIONS, value);

export const tasteFragranceMarkLabel = (value: TasteFragranceMark | string) =>
  labelFrom(TASTE_FRAGRANCE_MARK_OPTIONS, value);

export const tastePriorityLabel = (value: TastePriority | string) =>
  labelFrom(TASTE_PRIORITY_OPTIONS, value);

export function tasteActionMessage(result?: { ok: boolean; msg?: MessageLike } | null) {
  if (!result) return '';

  if (result.ok) {
    return result.msg ? `Р“РѕС‚РѕРІРѕ: ${String(result.msg)}` : 'Р“РѕС‚РѕРІРѕ';
  }

  if (typeof result.msg === 'string') {
    return result.msg;
  }

  if (Array.isArray(result.msg)) {
    return result.msg.join(', ');
  }

  if (result.msg && typeof result.msg === 'object') {
    const detail = (result.msg as Record<string, unknown>).detail;
    if (typeof detail === 'string') return detail;
    return JSON.stringify(result.msg);
  }

  return 'РЎС‚Р°Р»Р°СЃСЏ РїРѕРјРёР»РєР°. РЎРїСЂРѕР±СѓР№С‚Рµ С‰Рµ СЂР°Р·.';
}
